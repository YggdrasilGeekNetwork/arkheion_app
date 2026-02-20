import { useState } from 'react'
import type { CombatAction, Ability } from '~/types/character'
import ActionItem from './ActionItem'
import AbilityItem from './AbilityItem'

type ActionSection = {
  id: string
  label: string
  type: 'standard' | 'movement' | 'free' | 'full' | 'reaction' | 'other'
}

const actionSections: ActionSection[] = [
  { id: 'standard', label: 'Ações Padrão', type: 'standard' },
  { id: 'movement', label: 'Ações de Movimento', type: 'movement' },
  { id: 'free', label: 'Ações Livres', type: 'free' },
  { id: 'full', label: 'Ações Completas', type: 'full' },
  { id: 'reaction', label: 'Reações', type: 'reaction' },
  { id: 'other', label: 'Outras Ações', type: 'other' },
]

type ActionsCollapsibleProps = {
  actions: CombatAction[]
  abilities?: Ability[]
  onUseAction: (action: CombatAction) => void
  onUseAbility?: (ability: Ability) => void
  onToggleFavorite: (actionId: string) => void
  onToggleFavoriteAbility?: (abilityId: string) => void
  isOutOfTurn?: boolean
}

export default function ActionsCollapsible({
  actions,
  abilities = [],
  onUseAction,
  onUseAbility,
  onToggleFavorite,
  onToggleFavoriteAbility,
  isOutOfTurn = false,
}: ActionsCollapsibleProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId)
  }

  const getActionsForSection = (type: ActionSection['type']) => {
    return actions.filter(a => a.type === type)
  }

  const getAbilitiesForSection = (type: ActionSection['type']) => {
    // Only include active abilities with matching actionType
    return abilities.filter(a => a.type === 'active' && a.actionType === type)
  }

  return (
    <div className="space-y-2">
      {actionSections.map((section) => {
        const sectionActions = getActionsForSection(section.type)
        const sectionAbilities = getAbilitiesForSection(section.type)
        const totalItems = sectionActions.length + sectionAbilities.length
        const isOpen = openSection === section.id

        if (totalItems === 0) {
          return null
        }

        return (
          <div key={section.id} className="bg-card border border-stroke rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-2 hover:bg-card-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{section.label}</span>
                <span className="text-xs bg-card-muted px-2 py-0.5 rounded">
                  {totalItems}
                </span>
              </div>
              <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>

            {isOpen && (
              <div className="p-2 space-y-2">
                {/* Actions */}
                {sectionActions.map((action) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    onUse={onUseAction}
                    onToggleFavorite={() => onToggleFavorite(action.id)}
                    showFavorite={true}
                    isOutOfTurn={isOutOfTurn}
                  />
                ))}

                {/* Abilities (integrated with actions, no separator) */}
                {sectionAbilities.map((ability) => (
                  <AbilityItem
                    key={ability.id}
                    ability={ability}
                    onUse={onUseAbility ?? (() => {})}
                    onToggleFavorite={onToggleFavoriteAbility ? () => onToggleFavoriteAbility(ability.id) : undefined}
                    showFavorite={!!onToggleFavoriteAbility}
                    isOutOfTurn={isOutOfTurn}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
