'use client'

import { TipoFornecedor } from '@/types'
import { cn } from '@/utils/cn'

const FILTROS: { label: string; value: 'todos' | TipoFornecedor }[] = [
  { label: '🏪 Todos', value: 'todos' },
  { label: 'Supermercado', value: 'supermercado' },
  { label: 'Atacado', value: 'atacado' },
  { label: 'Frigorífico', value: 'frigorífico' },
  { label: 'Açougue', value: 'açougue' },
  { label: 'Hortifruti', value: 'hortifruti' },
]

interface FiltroFornecedoresProps {
  filtroAtivo: 'todos' | TipoFornecedor
  onChange: (filtro: 'todos' | TipoFornecedor) => void
}

export function FiltroFornecedores({ filtroAtivo, onChange }: FiltroFornecedoresProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTROS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'px-4 py-2 rounded-lg text-[13px] font-bold transition-all border',
            filtroAtivo === value
              ? 'bg-brand text-white border-brand'
              : 'bg-bg-hover text-text-muted border-border hover:text-text-secondary hover:border-border-focus'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
