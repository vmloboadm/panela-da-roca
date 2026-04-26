'use client'

import { Fornecedor } from '@/types'
import { Badge } from '@/components/ui'
import { fmtBRL } from '@/utils/calculos'

interface FornecedorCardProps {
  fornecedor: Fornecedor
  onEdit: (fornecedor: Fornecedor) => void
}

export function FornecedorCard({ fornecedor, onEdit }: FornecedorCardProps) {
  const custoLogistica = fornecedor.distancia_km * 1.20 * 2

  return (
    <div
      style={{ borderLeftColor: fornecedor.cor, borderColor: `${fornecedor.cor}33` }}
      className="bg-bg-card rounded-xl p-[14px] border border-l-4 flex flex-col gap-3 hover:bg-bg-hover transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-bold text-[15px] leading-tight truncate">
            {fornecedor.nome}
          </p>
          <p className="text-text-muted text-[12px] mt-0.5">{fornecedor.bairro}</p>
        </div>
        <Badge color={fornecedor.cor}>{fornecedor.tipo}</Badge>
      </div>

      {/* Distance + logistics */}
      <p className="text-text-muted text-[12px]">
        📍 {fornecedor.distancia_km}km &middot; Custo log:{' '}
        <span className="text-text-secondary">{fmtBRL(custoLogistica)}</span>
      </p>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {/* Instagram button */}
        {fornecedor.instagram_url ? (
          <a
            href={fornecedor.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-bg-base border border-border rounded-lg px-3 py-2 text-[12px] font-bold text-text-muted hover:text-text-secondary hover:border-border-light transition-colors"
          >
            <span>📸</span>
            <span>Instagram</span>
          </a>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-1.5 bg-bg-base border border-border rounded-lg px-3 py-2 text-[12px] font-bold text-text-faint cursor-default">
            <span>⚠️</span>
            <span>Sem Instagram</span>
          </div>
        )}

        {/* Edit button */}
        <button
          onClick={() => onEdit(fornecedor)}
          className="flex items-center justify-center gap-1.5 bg-bg-base border border-border rounded-lg px-3 py-2 text-[12px] font-bold text-text-muted hover:text-brand hover:border-brand transition-colors"
          title="Editar fornecedor"
        >
          ✏️
        </button>
      </div>
    </div>
  )
}
