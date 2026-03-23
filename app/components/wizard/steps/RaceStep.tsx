import { useWizard } from '~/contexts/WizardContext'
import { InlineChoiceResolver } from '../ChoiceResolver'
import type { AttributeValues } from '~/types/wizard'

const ATTR_LABELS: Record<keyof AttributeValues, string> = {
  FOR: 'Força', DES: 'Destreza', CON: 'Constituição',
  INT: 'Inteligência', SAB: 'Sabedoria', CAR: 'Carisma',
}

function fmt(v: number): string {
  return v >= 0 ? `+${v}` : `${v}`
}

export default function RaceStep() {
  const { state, loaderData, selectRace, getChoicesForStep, resolveChoice } = useWizard()
  const { race, attributes } = state.data
  const racialBonuses = state.computed.attributeBonuses

  const races = loaderData?.races || []
  const raceChoices = getChoicesForStep('race')

  const selectedRaceData = race ? races.find(r => r.id === race.id) : null

  const getRacialBonus = (attr: string): number =>
    racialBonuses.find(b => b.attribute === attr)?.value ?? 0

  const handleSelectRace = (raceId: string) => {
    const raceData = races.find(r => r.id === raceId)
    if (raceData) {
      selectRace({ id: raceData.id, name: raceData.name }, raceData)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Escolha sua Raça</h2>
        <p className="text-sm text-muted">
          A raça do seu personagem define suas características físicas e algumas habilidades especiais.
        </p>
      </div>

      {/* Race Selection Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {races.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => handleSelectRace(r.id)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              race?.id === r.id
                ? 'border-accent bg-accent/10'
                : 'border-stroke bg-card hover:border-accent/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-card-muted flex items-center justify-center text-2xl flex-shrink-0">
                {r.name === 'Humano' && '👤'}
                {r.name === 'Anão' && '⛏️'}
                {r.name === 'Elfo' && '🧝'}
                {r.name === 'Goblin' && '👺'}
                {!['Humano', 'Anão', 'Elfo', 'Goblin'].includes(r.name) && '🎭'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{r.name}</h3>
                <p className="text-xs text-muted line-clamp-2">{r.description}</p>

                {/* Attribute bonuses preview */}
                {r.attributeBonuses.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.attributeBonuses.map(bonus => (
                      <span
                        key={bonus.attribute}
                        className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded"
                      >
                        +{bonus.value} {bonus.attribute}
                      </span>
                    ))}
                  </div>
                )}

                {/* Special note for races with choices */}
                {r.choices && r.choices.length > 0 && (
                  <div className="mt-1 text-xs text-yellow-500">
                    Requer escolhas adicionais
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Race Details */}
      {selectedRaceData && (
        <div className="bg-card-muted border border-stroke rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Detalhes: {selectedRaceData.name}</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Stats */}
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">Características</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tamanho:</span>
                  <span className="font-medium">{selectedRaceData.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deslocamento:</span>
                  <span className="font-medium">{selectedRaceData.speed}m</span>
                </div>
              </div>
            </div>

            {/* Attribute bonuses */}
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">Bônus de Atributos</h4>
              <div className="space-y-1 text-sm">
                {selectedRaceData.attributeBonuses.length > 0 ? (
                  selectedRaceData.attributeBonuses.map(bonus => (
                    <div key={bonus.attribute} className="flex justify-between">
                      <span>{bonus.attribute}:</span>
                      <span className="font-medium text-accent">+{bonus.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted italic text-xs">Sem bônus fixos de atributo</p>
                )}
              </div>
            </div>
          </div>

          {/* Abilities */}
          <div>
            <h4 className="text-sm font-medium text-muted mb-2">Habilidades Raciais</h4>
            <div className="space-y-2">
              {selectedRaceData.abilities.map(ability => (
                <div key={ability.id} className="bg-card border border-stroke rounded p-2">
                  <span className="text-sm font-medium">{ability.name}</span>
                  {ability.description && (
                    <p className="text-xs text-muted mt-1">{ability.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Race Choices */}
      {raceChoices.length > 0 && (
        <InlineChoiceResolver
          choices={raceChoices}
          onResolve={resolveChoice}
        />
      )}

      {/* Attribute preview with racial bonuses */}
      {selectedRaceData && (
        <div className="bg-card-muted border border-stroke rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">
            Seus atributos com os bônus de {selectedRaceData.name}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-sm">
            {(Object.keys(ATTR_LABELS) as Array<keyof AttributeValues>).map(attr => {
              const base = attributes[attr]
              const bonus = getRacialBonus(attr)
              const total = base + bonus
              return (
                <div key={attr} className="bg-card border border-stroke rounded-lg p-2">
                  <div className="text-xs text-muted mb-1">{attr}</div>
                  <div className={`text-lg font-bold ${total >= 0 ? 'text-accent' : 'text-red-400'}`}>
                    {fmt(total)}
                  </div>
                  {bonus !== 0 ? (
                    <div className="text-xs mt-0.5 space-x-1">
                      <span className="text-muted">{fmt(base)}</span>
                      <span className={bonus > 0 ? 'text-green-400' : 'text-red-400'}>
                        {fmt(bonus)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted mt-0.5">{fmt(base)}</div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted mt-2">
            Base (definido em Atributos) + bônus racial = total final
          </p>
        </div>
      )}
    </div>
  )
}
