import type { Ability } from '~/types/character'

type AbilitiesStepProps = {
  availableAbilities: Ability[]
  selectedAbilities: Ability[]
  className: string
  newLevel: number
  onToggleAbility: (ability: Ability) => void
}

export default function AbilitiesStep({
  availableAbilities,
  selectedAbilities,
  className,
  newLevel,
  onToggleAbility,
}: AbilitiesStepProps) {
  const isSelected = (ability: Ability) =>
    selectedAbilities.some(a => a.id === ability.id)

  // Group abilities by type
  const passiveAbilities = availableAbilities.filter(a => a.type === 'passive')
  const activeAbilities = availableAbilities.filter(a => a.type === 'active')

  const renderAbilityCard = (ability: Ability) => {
    const selected = isSelected(ability)

    return (
      <button
        key={ability.id}
        onClick={() => onToggleAbility(ability)}
        className={`w-full p-3 rounded-lg border text-left transition-all ${
          selected
            ? 'border-accent bg-accent/10'
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
              selected
                ? 'bg-accent border-accent text-card'
                : 'border-stroke'
            }`}
          >
            {selected && '✓'}
          </div>
        </div>
      </button>
    )
  }

  if (availableAbilities.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Habilidades de Classe</h3>
          <p className="text-sm text-muted mb-4">
            {className} Nível {newLevel}
          </p>
        </div>

        <div className="p-8 text-center border border-dashed border-stroke rounded-lg">
          <div className="text-4xl mb-2 opacity-50">📚</div>
          <p className="text-muted">
            Nenhuma habilidade disponível para escolha neste nível.
          </p>
          <p className="text-xs text-muted mt-2">
            As habilidades automáticas da classe já foram aplicadas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Habilidades de Classe</h3>
        <p className="text-sm text-muted mb-4">
          Escolha as habilidades para {className} Nível {newLevel}
        </p>
      </div>

      {/* Passive Abilities */}
      {passiveAbilities.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted">Habilidades Passivas</div>
          {passiveAbilities.map(renderAbilityCard)}
        </div>
      )}

      {/* Active Abilities */}
      {activeAbilities.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted">Habilidades Ativas</div>
          {activeAbilities.map(renderAbilityCard)}
        </div>
      )}

      {selectedAbilities.length > 0 && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="text-sm">
            <strong>{selectedAbilities.length}</strong> habilidade(s) selecionada(s)
          </div>
        </div>
      )}
    </div>
  )
}
