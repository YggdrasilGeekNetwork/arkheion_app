import { useState } from 'react'
import type { Ability } from '~/types/character'
import AbilityItem from './AbilityItem'

type AbilitiesCollapsibleProps = {
  abilities: Ability[]
  onUseAbility: (ability: Ability) => void
  onToggleFavorite: (abilityId: string) => void
}

export default function AbilitiesCollapsible({
  abilities,
  onUseAbility,
  onToggleFavorite
}: AbilitiesCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Only show active abilities
  const activeAbilities = abilities.filter(a => a.type === 'active')

  if (activeAbilities.length === 0) {
    return null
  }

  return (
    <div className="bg-card border border-stroke rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 hover:bg-card-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Habilidades Ativas</span>
          <span className="text-xs bg-card-muted px-2 py-0.5 rounded">
            {activeAbilities.length}
          </span>
        </div>
        <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {isOpen && (
        <div className="p-2 space-y-2">
          {activeAbilities.map((ability) => (
            <AbilityItem
              key={ability.id}
              ability={ability}
              onUse={onUseAbility}
              onToggleFavorite={() => onToggleFavorite(ability.id)}
              showFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
