'use client'

import { useState, useRef, useEffect } from 'react'
import { Produto, MovimentacaoEstoque } from '@/types'
import { salvarEntrada } from '@/lib/services/estoque'
import { ItemCompraIA } from '@/app/api/gemini/processar-compra/route'
import { fmtBRL } from '@/utils/calculos'

type MensagemTipo = 'usuario' | 'ia_texto' | 'ia_compra' | 'sistema'

interface Mensagem {
  id: string
  tipo: MensagemTipo
  texto?: string
  itens?: ItemCompraIA[]
  observacao?: string | null
  salvando?: boolean
  salvo?: boolean
}

const PERGUNTAS_RAPIDAS = [
  'O que está acabando?',
  'Quais produtos estão abaixo do mínimo?',
  'Qual o valor total do meu estoque?',
  'O que preciso comprar essa semana?',
]

interface ChatEstoqueProps {
  produtos: Produto[]
  onEstoqueAtualizado: () => void
}

export function ChatEstoque({ produtos, onEstoqueAtualizado }: ChatEstoqueProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [processando, setProcessando] = useState(false)
  const [gravando, setGravando] = useState(false)
  const [temMicrofone, setTemMicrofone] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTemMicrofone(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  function addMensagem(m: Omit<Mensagem, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    setMensagens(prev => [...prev, { ...m, id }])
    return id
  }

  async function enviar(texto?: string, base64?: string, mimeType?: string) {
    const msg = texto?.trim() ?? (base64 ? '🎤 Áudio enviado' : '')
    if (!msg && !base64) return

    addMensagem({ tipo: 'usuario', texto: msg })
    setInput('')
    setProcessando(true)

    try {
      const body: Record<string, unknown> = {
        produtos: produtos.filter(p => p.ativo).map(p => ({
          id: p.id, nome: p.nome, categoria: p.categoria,
          subcategoria: p.subcategoria, sinonimos: p.sinonimos,
          unidade_padrao: p.unidade_padrao, estoque_atual: p.estoque_atual,
          estoque_minimo: p.estoque_minimo, custo_medio: p.custo_medio,
        })),
      }
      if (texto) body.mensagem = texto
      if (base64) { body.base64 = base64; body.mimeType = mimeType }

      const res = await fetch('/api/gemini/processar-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro na API')

      if (data.tipo === 'compra' && data.itens?.length > 0) {
        addMensagem({ tipo: 'ia_compra', itens: data.itens, observacao: data.observacao })
      } else if (data.tipo === 'consulta') {
        addMensagem({ tipo: 'ia_texto', texto: data.resposta })
      } else {
        addMensagem({ tipo: 'ia_texto', texto: 'Não entendi. Tente dizer o que comprou ou fazer uma pergunta.' })
      }
    } catch (e) {
      addMensagem({ tipo: 'sistema', texto: `Erro: ${e instanceof Error ? e.message : 'desconhecido'}` })
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarCompra(msgId: string, itens: ItemCompraIA[]) {
    setMensagens(prev => prev.map(m => m.id === msgId ? { ...m, salvando: true } : m))
    const hoje = new Date().toISOString().split('T')[0]
    let salvos = 0

    for (const item of itens) {
      if (!item.produto_id || item.quantidade <= 0) continue
      const produto = produtos.find(p => p.id === item.produto_id)
      if (!produto) continue
      try {
        const mov: Omit<MovimentacaoEstoque, 'id'> = {
          produto_id: item.produto_id,
          tipo: 'entrada',
          quantidade: item.quantidade,
          unidade: item.unidade,
          custo_unitario: item.preco_unitario ?? undefined,
          origem: 'manual',
          confianca: 'confirmado',
          ia_pre_preenchido: true,
          data: hoje,
          confirmado_em: new Date().toISOString(),
        }
        await salvarEntrada(mov, produto)
        salvos++
      } catch { /* skip individual failure */ }
    }

    setMensagens(prev => prev.map(m => m.id === msgId ? { ...m, salvando: false, salvo: true } : m))
    if (salvos > 0) {
      onEstoqueAtualizado()
      addMensagem({ tipo: 'sistema', texto: `✓ ${salvos} produto${salvos !== 1 ? 's' : ''} adicionado${salvos !== 1 ? 's' : ''} ao estoque.` })
    }
  }

  async function iniciarGravacao() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunks.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks.current, { type: mimeType.split(';')[0] })
        const base64 = await new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onloadend = () => resolve((reader.result as string).split(',')[1])
          reader.readAsDataURL(blob)
        })
        await enviar(undefined, base64, mimeType.split(';')[0])
      }
      recorder.start()
      mediaRecorder.current = recorder
      setGravando(true)
    } catch {
      addMensagem({ tipo: 'sistema', texto: 'Sem acesso ao microfone. Verifique as permissões.' })
    }
  }

  function pararGravacao() {
    mediaRecorder.current?.stop()
    setGravando(false)
  }

  const vazio = mensagens.length === 0

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-3">
        {vazio && (
          <div className="flex flex-col gap-3 py-4">
            <p className="text-text-muted text-xs text-center">
              🤖 Diga o que comprou ou faça uma pergunta sobre o estoque
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {PERGUNTAS_RAPIDAS.map(q => (
                <button
                  key={q}
                  onClick={() => enviar(q)}
                  disabled={processando}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-text-muted hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map(msg => (
          <div key={msg.id} className={['flex', msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'].join(' ')}>
            {msg.tipo === 'usuario' && (
              <div className="bg-brand/10 border border-brand/20 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                <p className="text-text-primary text-sm">{msg.texto}</p>
              </div>
            )}

            {msg.tipo === 'ia_texto' && (
              <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                <p className="text-[10px] text-brand font-bold mb-1">🤖 Assistente</p>
                <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
              </div>
            )}

            {msg.tipo === 'ia_compra' && msg.itens && (
              <div className="bg-white border border-success/30 rounded-2xl rounded-tl-sm px-3 py-3 w-full max-w-[95%] flex flex-col gap-2">
                <p className="text-[10px] text-success font-bold">🛒 Compra detectada — confirme antes de salvar</p>

                {msg.itens.map((item, i) => (
                  <div key={i} className={['rounded-lg px-2.5 py-2 flex items-start justify-between gap-2',
                    item.produto_id ? 'bg-white' : 'bg-warning/10 border border-warning/20',
                  ].join(' ')}>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-xs font-semibold truncate">{item.produto_nome}</p>
                      {!item.produto_id && (
                        <p className="text-warning text-[10px]">⚠️ Produto não mapeado</p>
                      )}
                      <p className="text-text-faint text-[10px]">
                        {item.quantidade}{item.unidade}
                        {item.preco_unitario ? ` · ${fmtBRL(item.preco_unitario)}/${item.unidade}` : ''}
                        {item.preco_unitario ? ` = ${fmtBRL(item.quantidade * item.preco_unitario)}` : ''}
                      </p>
                    </div>
                    <span className={['text-[9px] px-1.5 py-0.5 rounded-full font-bold',
                      item.confianca_match === 'alta' ? 'bg-success/20 text-success' :
                      item.confianca_match === 'media' ? 'bg-warning/20 text-warning' :
                      'bg-danger/20 text-danger'
                    ].join(' ')}>
                      {item.confianca_match}
                    </span>
                  </div>
                ))}

                {msg.observacao && (
                  <p className="text-text-faint text-[10px]">{msg.observacao}</p>
                )}

                {!msg.salvo && !msg.salvando && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => confirmarCompra(msg.id, msg.itens!.filter(i => !!i.produto_id))}
                      disabled={!msg.itens.some(i => i.produto_id)}
                      className="flex-1 text-xs font-bold text-white bg-success hover:opacity-90 rounded-lg py-2 transition-colors disabled:opacity-40"
                    >
                      ✓ Confirmar e salvar no estoque
                    </button>
                  </div>
                )}
                {msg.salvando && (
                  <p className="text-success text-xs text-center animate-pulse">Salvando...</p>
                )}
                {msg.salvo && (
                  <p className="text-success text-xs text-center">✓ Salvo no estoque</p>
                )}
              </div>
            )}

            {msg.tipo === 'sistema' && (
              <div className="w-full flex justify-center">
                <p className="text-text-faint text-[10px] bg-border/50 rounded-full px-3 py-1">{msg.texto}</p>
              </div>
            )}
          </div>
        ))}

        {processando && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border pt-3 flex gap-2 items-end">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !processando && enviar(input)}
          placeholder={gravando ? 'Gravando... toque para parar' : 'Comprei hoje... ou faça uma pergunta'}
          disabled={processando || gravando}
          className="flex-1 bg-white border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm placeholder:text-text-faint focus:border-brand outline-none disabled:opacity-50"
        />

        {temMicrofone && (
          <button
            onClick={gravando ? pararGravacao : iniciarGravacao}
            disabled={processando}
            className={[
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all text-base shrink-0',
              gravando
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white border border-border text-text-muted hover:border-brand hover:text-brand',
            ].join(' ')}
            title={gravando ? 'Parar gravação' : 'Gravar áudio'}
          >
            {gravando ? '⏹' : '🎤'}
          </button>
        )}

        <button
          onClick={() => enviar(input)}
          disabled={!input.trim() || processando || gravando}
          className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center text-base shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
