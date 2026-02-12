import { Link } from '@remix-run/react'

type DMTopBarProps = {
  mesaName: string
  onBack?: () => void
}

export default function DMTopBar({ mesaName, onBack }: DMTopBarProps) {
  return (
    <div className="h-12 bg-card border-b border-stroke flex items-center px-4 gap-4 flex-shrink-0">
      {onBack ? (
        <button
          onClick={onBack}
          className="text-muted hover:text-text transition-colors"
        >
          ← Voltar
        </button>
      ) : (
        <Link
          to="/dm/mesas"
          className="text-muted hover:text-text transition-colors"
        >
          ← Mesas
        </Link>
      )}

      <div className="h-6 w-px bg-stroke" />

      <div className="flex items-center gap-2">
        <span className="text-xl">🎲</span>
        <h1 className="font-bold truncate">{mesaName}</h1>
      </div>

      <div className="flex-1" />

      <div className="text-xs text-muted">
        Visão do Mestre
      </div>
    </div>
  )
}
