import { useState } from 'react'
import type { CombatAction } from '~/types/character'
import ActionItem from './ActionItem'

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
  onUseAction: (action: CombatAction) => void
  onToggleFavorite: (actionId: string) => void
}

export default function ActionsCollapsible({
  actions,
  onUseAction,
  onToggleFavorite
}: ActionsCollapsibleProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId)
  }

  const getActionsForSection = (type: ActionSection['type']) => {
    return actions.filter(a => a.type === type)
  }

  return (
    <div className="space-y-2">
      {actionSections.map((section) => {
        const sectionActions = getActionsForSection(section.type)
        const isOpen = openSection === section.id

        if (sectionActions.length === 0) {
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
                  {sectionActions.length}
                </span>
              </div>
              <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>

            {isOpen && (
              <div className="p-2 space-y-2">
                {sectionActions.map((action) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    onUse={onUseAction}
                    onToggleFavorite={() => onToggleFavorite(action.id)}
                    showFavorite={true}
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
