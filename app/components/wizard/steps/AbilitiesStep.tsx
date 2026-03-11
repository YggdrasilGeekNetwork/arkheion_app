import { useState } from 'react'
import { useWizard } from '~/contexts/WizardContext'
import { InlineChoiceResolver } from '../ChoiceResolver'

type AbilityDisplay = {
  id: string
  name: string
  description?: string
  source: string
}

export default function AbilitiesStep() {
  const { state, loaderData, getChoicesForStep, resolveChoice } = useWizard()
  const { race, classes: selectedClasses } = state.data

  const races = loaderData?.races || []
  const allClasses = loaderData?.classes || []
  const abilityChoices = getChoicesForStep('abilities')

  const [expandedAbility, setExpandedAbility] = useState<string | null>(null)

  // Collect all granted abilities from race and classes
  const allAbilities = (): AbilityDisplay[] => {
    const abilities: AbilityDisplay[] = []

    // Race abilities
    if (race) {
      const raceData = races.find(r => r.id === race.id)
      if (raceData) {
        raceData.abilities.forEach(ability => {
          abilities.push({
            id: `race-${ability.id}`,
            name: ability.name,
            description: ability.description,
            source: raceData.name,
          })
        })
      }
    }

    // Class abilities
    selectedClasses.forEach(cls => {
      const classData = allClasses.find(c => c.id === cls.id)
      if (classData) {
        classData.abilities.forEach(ability => {
          abilities.push({
            id: `class-${classData.id}-${ability.id}`,
            name: ability.name,
            description: ability.description,
            source: classData.name,
          })
        })
      }
    })

    return abilities
  }

  const abilities = allAbilities()

  const toggleExpand = (abilityId: string) => {
    setExpandedAbility(expandedAbility === abilityId ? null : abilityId)
  }

  const AbilityCard = ({ ability }: { ability: AbilityDisplay }) => {
    const isExpanded = expandedAbility === ability.id

    return (
      <div className="bg-card border border-stroke rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => ability.description && toggleExpand(ability.id)}
          className="w-full text-left p-3 hover:bg-card-muted transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-medium">{ability.name}</span>
              <p className="text-xs text-muted mt-0.5">{ability.source}</p>
            </div>
            {ability.description && (
              <div className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        </button>

        {isExpanded && ability.description && (
          <div className="px-3 pb-3 pt-0 border-t border-stroke">
            <p className="text-sm text-muted mt-2">{ability.description}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Habilidades</h2>
        <p className="text-sm text-muted">
          Estas são as habilidades que seu personagem recebe da raça e classe selecionadas.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-card-muted border border-stroke rounded-lg p-3 text-center">
        <div className="text-2xl font-bold">{abilities.length}</div>
        <div className="text-xs text-muted">Habilidades</div>
      </div>

      {/* Ability Choices */}
      {abilityChoices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Escolhas de Habilidades</h3>
          <InlineChoiceResolver
            choices={abilityChoices}
            onResolve={resolveChoice}
          />
        </div>
      )}

      {/* All Abilities */}
      {abilities.length > 0 && (
        <div className="space-y-2">
          {abilities.map(ability => (
            <AbilityCard key={ability.id} ability={ability} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {abilities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎭</div>
          <p className="text-muted">
            Selecione uma raça e classe para ver as habilidades disponíveis.
          </p>
        </div>
      )}

      <div className="bg-card-muted border border-stroke rounded-lg p-3 text-xs text-muted">
        <strong>Nota:</strong> Habilidades passivas estão sempre ativas.
        Habilidades ativas precisam ser ativadas durante o jogo, geralmente custando ação e/ou PM.
      </div>
    </div>
  )
}
