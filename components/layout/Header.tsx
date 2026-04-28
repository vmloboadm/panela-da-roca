import Image from 'next/image'

export function Header() {
  return (
    <header className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-40">
      <Image src="/logo.png" alt="Panela da Roça" width={38} height={38} className="rounded-lg" />
      <div>
        <div className="font-extrabold text-base text-text-primary leading-tight">Panela da Roça</div>
        <div className="text-[10px] text-text-faint tracking-wide uppercase">Sistema de Gestão</div>
      </div>
    </header>
  )
}
