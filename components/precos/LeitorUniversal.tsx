'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { LeituraIAResultado } from '@/types'
import { lerArquivo } from '@/lib/services/leitura-ia'
import { Button } from '@/components/ui'

interface LeitorUniversalProps {
  onResultado: (resultado: LeituraIAResultado, nomeArquivo: string) => void
  contexto?: string
  accept?: string
  disabled?: boolean
}

const ACCEPT_DEFAULT = 'image/jpeg,image/png,image/webp,image/heic,application/pdf,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac'

const TIPO_LABELS: Record<string, string> = {
  'image/jpeg': '📷 Imagem',
  'image/png': '📷 Imagem',
  'image/webp': '📷 Imagem',
  'image/heic': '📷 Imagem',
  'application/pdf': '📄 PDF',
  'audio/mpeg': '🎵 Áudio',
  'audio/wav': '🎵 Áudio',
  'audio/ogg': '🎵 Áudio',
  'audio/mp4': '🎵 Áudio',
  'audio/aac': '🎵 Áudio',
}

export function LeitorUniversal({ onResultado, contexto, accept = ACCEPT_DEFAULT, disabled }: LeitorUniversalProps) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ url: string; tipo: string; nome: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function processarArquivo(file: File) {
    setErro(null)
    setPreview({
      url: URL.createObjectURL(file),
      tipo: file.type,
      nome: file.name,
    })
    setLoading(true)
    try {
      const resultado = await lerArquivo(file, contexto)
      onResultado(resultado, file.name)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar arquivo')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processarArquivo(file)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processarArquivo(file)
    e.target.value = ''
  }

  const tipoLabel = preview ? (TIPO_LABELS[preview.tipo] ?? '📎 Arquivo') : null
  const isImagem = preview?.tipo.startsWith('image/')

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer select-none',
          dragging ? 'border-brand bg-brand/10' : 'border-border hover:border-border-light',
          (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
          disabled={disabled || loading}
        />

        {loading ? (
          <>
            <div className="text-2xl animate-pulse">🤖</div>
            <p className="text-text-muted text-sm text-center">Lendo com IA...</p>
          </>
        ) : preview ? (
          <>
            {isImagem && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt="preview" className="max-h-32 rounded-lg object-contain" />
            )}
            {!isImagem && <div className="text-4xl">{tipoLabel?.split(' ')[0]}</div>}
            <p className="text-text-muted text-xs text-center">{tipoLabel} · {preview.nome}</p>
            <p className="text-text-faint text-xs">Clique para trocar o arquivo</p>
          </>
        ) : (
          <>
            <div className="text-3xl">📎</div>
            <p className="text-text-primary text-sm font-medium text-center">
              Jogue qualquer coisa aqui
            </p>
            <p className="text-text-muted text-xs text-center">
              Foto, print de WhatsApp, print de Instagram, folheto, PDF, áudio
            </p>
            <Button variant="ghost" className="text-xs mt-1" disabled={disabled}>
              Escolher arquivo
            </Button>
          </>
        )}
      </div>

      {erro && (
        <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{erro}</p>
      )}
    </div>
  )
}
