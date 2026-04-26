'use client'

import { useState, useEffect, useCallback } from 'react'
import { Fornecedor, TipoFornecedor } from '@/types'
import { seedIfEmpty } from '@/lib/seed'
import { getFornecedores } from '@/lib/services/fornecedores'
import { Button } from '@/components/ui'
import { SectionTitle } from '@/components/ui'
import { FornecedorCard } from '@/components/fornecedores/FornecedorCard'
import { FornecedorModal } from '@/components/fornecedores/FornecedorModal'
import { FiltroFornecedores } from '@/components/fornecedores/FiltroFornecedores'

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | TipoFornecedor>('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Fornecedor | null>(null)

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

  useEffect(() => {
    async function init() {
      await seedIfEmpty()
      await carregarFornecedores()
    }
    init()
  }, [carregarFornecedores])

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

  return (
    <div className="fadein max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionTitle icon="🏪">Fornecedores</SectionTitle>
        <Button onClick={abrirNovoFornecedor}>
          ➕ Novo Fornecedor
        </Button>
      </div>

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
    </div>
  )
}
