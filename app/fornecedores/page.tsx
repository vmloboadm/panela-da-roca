'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Fornecedor, TipoFornecedor, Representante } from '@/types'
import { seedIfEmpty } from '@/lib/seed'
import { getFornecedores } from '@/lib/services/fornecedores'
import { getRepresentantes } from '@/lib/services/representantes'
import { Button } from '@/components/ui'
import { SectionTitle } from '@/components/ui'
import { FornecedorCard } from '@/components/fornecedores/FornecedorCard'
import { FornecedorModal } from '@/components/fornecedores/FornecedorModal'
import { FiltroFornecedores } from '@/components/fornecedores/FiltroFornecedores'
import { RepresentanteModal } from '@/components/fornecedores/RepresentanteModal'
import { cn } from '@/utils/cn'

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | TipoFornecedor>('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Fornecedor | null>(null)

  const [tabAtiva, setTabAtiva] = useState<'fornecedores' | 'representantes'>('fornecedores')
  const [representantes, setRepresentantes] = useState<Representante[]>([])
  const [loadingRep, setLoadingRep] = useState(false)
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null)
  const [modalRepOpen, setModalRepOpen] = useState(false)
  const [editandoRep, setEditandoRep] = useState<Representante | null>(null)

  const carregarFornecedores = useCallback(async () => {
    setLoading(true)
    try {
      const lista = await getFornecedores()
      setFornecedores(lista.filter(f => f.ativo))
    } catch (e) {
      console.error('Erro ao carregar fornecedores:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const carregarRepresentantes = useCallback(async () => {
    setLoadingRep(true)
    try {
      const data = await getRepresentantes()
      setRepresentantes(data)
    } finally {
      setLoadingRep(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      await seedIfEmpty()
      await carregarFornecedores()
    }
    init()
  }, [carregarFornecedores])

  useEffect(() => {
    if (tabAtiva === 'representantes') carregarRepresentantes()
  }, [tabAtiva, carregarRepresentantes])

  function abrirNovoFornecedor() {
    setEditando(null)
    setModalOpen(true)
  }

  function abrirEdicao(fornecedor: Fornecedor) {
    setEditando(fornecedor)
    setModalOpen(true)
  }

  function fecharModal() {
    setModalOpen(false)
    setEditando(null)
  }

  async function handleSaved() {
    fecharModal()
    await carregarFornecedores()
  }

  const filtrados =
    filtro === 'todos'
      ? fornecedores
      : fornecedores.filter(f => f.tipo === filtro)

  const representantesFiltrados = useMemo(
    () => representantes.filter(r => filtroAtivo === null || r.ativo === filtroAtivo),
    [representantes, filtroAtivo]
  )

  return (
    <div className="fadein max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionTitle icon="🏪">Fornecedores</SectionTitle>
        {tabAtiva === 'fornecedores' && (
          <Button onClick={abrirNovoFornecedor}>
            ➕ Novo Fornecedor
          </Button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-4">
        {(['fornecedores', 'representantes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setTabAtiva(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize',
              tabAtiva === tab
                ? 'border-brand text-brand'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            {tab === 'fornecedores' ? 'Fornecedores' : 'Representantes'}
          </button>
        ))}
      </div>

      {tabAtiva === 'fornecedores' && (
        <>
          {/* Filters */}
          <FiltroFornecedores filtroAtivo={filtro} onChange={setFiltro} />

          {/* Count */}
          {!loading && (
            <p className="text-text-muted text-[13px]">
              {filtrados.length} fornecedor{filtrados.length !== 1 ? 'es' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-text-muted text-[13px]">Carregando fornecedores...</p>
              </div>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-4xl">🏪</p>
              <p className="text-text-muted text-[14px]">
                {filtro === 'todos'
                  ? 'Nenhum fornecedor cadastrado ainda.'
                  : `Nenhum fornecedor do tipo "${filtro}" encontrado.`}
              </p>
              {filtro === 'todos' && (
                <Button onClick={abrirNovoFornecedor}>Adicionar primeiro fornecedor</Button>
              )}
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
            >
              {filtrados.map(fornecedor => (
                <FornecedorCard
                  key={fornecedor.id}
                  fornecedor={fornecedor}
                  onEdit={abrirEdicao}
                />
              ))}
            </div>
          )}

          {/* Modal */}
          {modalOpen && (
            <FornecedorModal
              fornecedor={editando}
              onClose={fecharModal}
              onSaved={handleSaved}
            />
          )}
        </>
      )}

      {tabAtiva === 'representantes' && (
        <div className="flex flex-col gap-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <select
              value={filtroAtivo === null ? 'todos' : filtroAtivo ? 'ativos' : 'inativos'}
              onChange={e => setFiltroAtivo(e.target.value === 'todos' ? null : e.target.value === 'ativos')}
              className="bg-bg-card border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
            <button
              onClick={() => { setEditandoRep(null); setModalRepOpen(true) }}
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-colors"
            >
              + Novo Representante
            </button>
          </div>

          {/* Loading */}
          {loadingRep && <p className="text-text-muted text-sm">Carregando…</p>}

          {/* Card grid */}
          {!loadingRep && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {representantesFiltrados
                .map(rep => (
                  <div
                    key={rep.id}
                    onClick={() => { setEditandoRep(rep); setModalRepOpen(true) }}
                    className="bg-bg-card border border-border rounded-2xl p-4 flex flex-col gap-2 cursor-pointer hover:bg-bg-hover transition-colors shadow-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-text-primary font-semibold text-sm">{rep.empresa}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full shrink-0',
                        rep.ativo ? 'bg-success/20 text-success' : 'bg-border text-text-muted',
                      )}>
                        {rep.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {rep.nome && <p className="text-text-secondary text-xs">{rep.nome}</p>}
                    <div className="flex gap-3 text-xs">
                      {rep.telefone && (
                        <a href={`tel:${rep.telefone}`} onClick={e => e.stopPropagation()} className="text-brand hover:underline">
                          📞 {rep.telefone}
                        </a>
                      )}
                      {rep.whatsapp && (
                        <a href={`https://wa.me/${rep.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-success hover:underline">
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              {representantesFiltrados.length === 0 && !loadingRep && (
                <p className="text-text-muted text-sm col-span-full">Nenhum representante encontrado.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Representante modal */}
      {modalRepOpen && (
        <RepresentanteModal
          representante={editandoRep}
          onClose={() => setModalRepOpen(false)}
          onSaved={carregarRepresentantes}
        />
      )}
    </div>
  )
}
