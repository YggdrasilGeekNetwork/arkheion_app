import { useState } from 'react'
import type { Ability } from '~/types/character'
import Tooltip from '~/components/ui/Tooltip'

const ACTION_TYPE_LABELS: Record<string, string> = {
  standard: 'Padrão',
  movement: 'Movimento',
  free: 'Livre',
  full: 'Completa',
  reaction: 'Reação',
}

type AbilityItemProps = {
  ability: Ability
  onUse: (ability: Ability) => void
  compact?: boolean
  onToggleFavorite?: () => void
  showFavorite?: boolean
}

export default function AbilityItem({ ability, onUse, compact = false, onToggleFavorite, showFavorite = false }: AbilityItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onUse(ability)
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const getCostText = () => {
    if (!ability.cost) return null
    const parts: string[] = []
    if (ability.cost.pv) parts.push(`${ability.cost.pv} PV`)
    if (ability.cost.pm) parts.push(`${ability.cost.pm} PM`)
    return parts.join(' + ')
  }

  const costText = getCostText()

  const cardContent = (
    <div className="bg-card-muted border border-stroke rounded-lg p-2 transition-colors relative hover:border-accent">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{ability.name}</div>
          <div className="flex items-center gap-2 flex-wrap">
            {ability.actionType && (
              <div className="text-xs text-blue-400 font-semibold">{ACTION_TYPE_LABELS[ability.actionType]}</div>
            )}
            {costText && (
              <div className="text-xs text-purple-400 font-semibold">{costText}</div>
            )}
            {ability.usesPerDay !== undefined && (
              <div className="text-xs text-muted font-semibold">
                ({ability.usesPerDay}x/dia)
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showFavorite && onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="text-lg leading-none hover:scale-110 transition-transform"
              style={{ color: ability.isFavorite ? '#fbbf24' : '#9ca3af' }}
            >
              {ability.isFavorite ? '★' : '☆'}
            </button>
          )}
          {!showConfirm ? (
            <button
              onClick={handleClick}
              className="px-2 py-1 bg-accent text-card rounded hover:bg-accent-hover transition-colors text-xs font-semibold whitespace-nowrap"
            >
              Usar
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
        <Tooltip content={ability.description}>
          <div className="text-xs text-muted line-clamp-2">{ability.description}</div>
        </Tooltip>
      )}
    </div>
  )

  // Em modo compacto, envolve todo o card no tooltip
  if (compact) {
    return (
      <Tooltip content={ability.description}>
        {cardContent}
      </Tooltip>
    )
  }

  // Modo normal retorna o card diretamente
  return cardContent
}
