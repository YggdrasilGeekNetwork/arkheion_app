import { useState } from 'react'
import type { WeaponAttack } from '~/types/character'
import Tooltip from '~/components/ui/Tooltip'

type WeaponItemProps = {
  weapon: WeaponAttack
  onUse: (weapon: WeaponAttack) => void
  onRollDamage?: (weapon: WeaponAttack) => void
  compact?: boolean
}

export default function WeaponItem({ weapon, onUse, onRollDamage, compact = false }: WeaponItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onUse(weapon)
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const tooltipContent = `Ataque: ${weapon.attackBonus >= 0 ? '+' : ''}${weapon.attackBonus}\nDano: ${weapon.damage}${weapon.damageType ? ` (${weapon.damageType})` : ''}\nCrítico: ${weapon.critRange}/${weapon.critMultiplier}${weapon.range ? `\nAlcance: ${weapon.range}` : ''}`

  const cardContent = (
    <div className="bg-card-muted border border-stroke rounded-lg p-2 transition-colors relative hover:border-accent">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{weapon.name}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs text-muted font-semibold">
              {weapon.attackBonus >= 0 ? '+' : ''}{weapon.attackBonus} | {weapon.damage}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          {!showConfirm ? (
            <button
              onClick={handleClick}
              className="px-2 py-1 bg-accent text-card rounded hover:bg-accent-hover transition-colors text-xs font-semibold whitespace-nowrap"
            >
              Atacar
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
          {onRollDamage && (
            <button
              onClick={() => onRollDamage(weapon)}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-semibold whitespace-nowrap"
            >
              Dano
            </button>
          )}
        </div>
      </div>

      {!compact && (
        <div className="text-xs text-muted">
          Crítico: {weapon.critRange}/{weapon.critMultiplier}
          {weapon.range && ` | Alcance: ${weapon.range}`}
        </div>
      )}
    </div>
  )

  // Em modo compacto, envolve todo o card no tooltip
  if (compact) {
    return (
      <Tooltip content={tooltipContent}>
        {cardContent}
      </Tooltip>
    )
  }

  // Modo normal retorna o card diretamente
  return cardContent
}
