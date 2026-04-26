'use client'
import { useEffect, useState } from 'react'

export function Header() {
  const [dataHoje, setDataHoje] = useState('')

  useEffect(() => {
    setDataHoje(
      new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    )
  }, [])

  return (
    <header className="bg-bg-card border-b border-[#1e2130] px-6 py-[14px] flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <span className="text-[30px]">🍳</span>
        <div>
          <div className="font-extrabold text-base text-text-primary">Panela da Roça</div>
          <div className="text-[10px] text-text-faint tracking-[1.5px] uppercase">
            Sistema Inteligente de Gestão · Campos dos Goytacazes
          </div>
        </div>
      </div>
      <div className="flex gap-[10px] items-center flex-wrap">
        <span className="text-[11px] text-text-faint">{dataHoje}</span>
      </div>
    </header>
  )
}
