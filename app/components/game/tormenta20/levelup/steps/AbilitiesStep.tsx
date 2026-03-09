import type { Ability } from '~/types/character'

type AbilitiesStepProps = {
  availableAbilities: Ability[]
  selectedAbilities: Ability[]
  className: string
  newLevel: number
  powerChoices: number
  fixedAbilities: string[]
  isLoading: boolean
  onToggleAbility: (ability: Ability) => void
}

export default function AbilitiesStep({
  availableAbilities,
  selectedAbilities,
  className,
  newLevel,
  powerChoices,
  fixedAbilities,
  isLoading,
  onToggleAbility,
}: AbilitiesStepProps) {
  const isSelected = (ability: Ability) =>
    selectedAbilities.some(a => a.id === ability.id)

  const passiveAbilities = availableAbilities.filter(a => a.type === 'passive')
  const activeAbilities = availableAbilities.filter(a => a.type === 'active')

  const renderAbilityCard = (ability: Ability) => {
    const selected = isSelected(ability)
    const atLimit = powerChoices > 0 && selectedAbilities.length >= powerChoices && !selected

    return (
      <button
        key={ability.id}
        onClick={() => onToggleAbility(ability)}
        disabled={atLimit}
        className={`w-full p-3 rounded-lg border text-left transition-all ${
          selected
            ? 'border-accent bg-accent/10'
            : atLimit
              ? 'border-stroke bg-card opacity-40 cursor-not-allowed'
              : 'border-stroke bg-card hover:border-accent/50'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{ability.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  ability.type === 'passive'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}
              >
                {ability.type === 'passive' ? 'Passiva' : 'Ativa'}
              </span>
            </div>
            <p className="text-sm text-muted mt-1 line-clamp-2">
              {ability.description}
            </p>
            {ability.cost && (
              <div className="flex gap-2 mt-2 text-xs">
                {ability.cost.pm && (
                  <span className="text-blue-400">{ability.cost.pm} PM</span>
                )}
                {ability.cost.pv && (
                  <span className="text-red-400">{ability.cost.pv} PV</span>
                )}
              </div>
            )}
          </div>
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
              selected ? 'bg-accent border-accent text-card' : 'border-stroke'
            }`}
          >
            {selected && '✓'}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Habilidades de Classe</h3>
        <p className="text-sm text-muted mb-4">
          {className} Nível {newLevel}
        </p>
      </div>

      {/* Fixed (automatic) abilities */}
      {fixedAbilities.length > 0 && (
        <div>
          <div className="text-sm font-medium text-muted mb-2">Habilidades automáticas</div>
          <div className="p-3 bg-card border border-stroke rounded-lg space-y-1">
            {fixedAbilities.map((name, i) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selectable powers */}
      {isLoading ? (
        <div className="p-8 text-center text-muted text-sm">Carregando poderes...</div>
      ) : powerChoices === 0 && fixedAbilities.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-stroke rounded-lg">
          <div className="text-4xl mb-2 opacity-50">📚</div>
          <p className="text-muted">Nenhuma habilidade disponível para escolha neste nível.</p>
          <p className="text-xs text-muted mt-2">As habilidades automáticas da classe já foram aplicadas.</p>
        </div>
      ) : powerChoices > 0 && (
        <div>
          <div className="text-sm font-medium text-muted mb-2">
            Escolha {powerChoices} poder{powerChoices > 1 ? 'es' : ''} de classe
            <span className="ml-2 text-accent">({selectedAbilities.length}/{powerChoices})</span>
          </div>

          {passiveAbilities.length > 0 && (
            <div className="space-y-2 mb-3">
              <div className="text-xs font-medium text-muted">Passivos</div>
              {passiveAbilities.map(renderAbilityCard)}
            </div>
          )}

          {activeAbilities.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted">Ativos</div>
              {activeAbilities.map(renderAbilityCard)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
