import { useState } from 'react'
import type { CombatAction } from '~/types/character'
import Tooltip from '~/components/ui/Tooltip'

type ActionItemProps = {
  action: CombatAction
  onUse: (action: CombatAction) => void
  compact?: boolean
  onToggleFavorite?: () => void
  showFavorite?: boolean
}

export default function ActionItem({ action, onUse, compact = false, onToggleFavorite, showFavorite = false }: ActionItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onUse(action)
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const getCostText = () => {
    if (!action.cost) return null
    const parts: string[] = []
    if (action.cost.pv) parts.push(`${action.cost.pv} PV`)
    if (action.cost.pm) parts.push(`${action.cost.pm} PM`)
    return parts.join(' + ')
  }

  const costText = getCostText()

  // Verificar se a ação já foi usada o máximo de vezes permitidas
  const isDisabled = action.usesPerTurn !== undefined &&
                     (action.usedThisTurn || 0) >= action.usesPerTurn

  const usageText = action.usesPerTurn !== undefined
    ? `${action.usedThisTurn || 0}/${action.usesPerTurn}`
    : null

  const cardContent = (
    <div className={`bg-card-muted border border-stroke rounded-lg p-2 transition-colors relative ${
      isDisabled ? 'opacity-50' : 'hover:border-accent'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{action.name}</div>
          <div className="flex items-center gap-2 flex-wrap">
            {costText && (
              <div className="text-xs text-red-500 font-semibold">{costText}</div>
            )}
            {action.resistance && (
              <div className="text-xs text-accent font-semibold">{action.resistance}</div>
            )}
            {usageText && (
              <div className={`text-xs font-semibold ${isDisabled ? 'text-red-500' : 'text-muted'}`}>
                ({usageText})
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showFavorite && onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="text-lg leading-none hover:scale-110 transition-transform"
              style={{ color: action.isFavorite ? '#fbbf24' : '#9ca3af' }}
            >
              {action.isFavorite ? '★' : '☆'}
            </button>
          )}
          {!showConfirm ? (
            <button
              onClick={handleClick}
              disabled={isDisabled}
              className="px-2 py-1 bg-accent text-card rounded hover:bg-accent-hover transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isDisabled ? 'Usada' : 'Usar'}
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleConfirm}
                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-semibold"
              >
                ✓
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 bg-card border border-stroke rounded hover:border-accent transition-colors text-xs font-semibold"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <Tooltip content={action.tooltip || action.effect}>
          <div className="text-xs text-muted line-clamp-2">{action.effect}</div>
        </Tooltip>
      )}
    </div>
  )

  // Em modo compacto, envolve todo o card no tooltip
  if (compact) {
    return (
      <Tooltip content={action.tooltip || action.effect}>
        {cardContent}
      </Tooltip>
    )
  }

  // Modo normal retorna o card diretamente
  return cardContent
}
