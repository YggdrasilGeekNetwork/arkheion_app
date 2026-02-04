import { useWizard } from '~/contexts/WizardContext'
import { InlineChoiceResolver } from '../ChoiceResolver'

export default function RaceStep() {
  const { state, dispatch, loaderData, selectRace, getChoicesForStep, resolveChoice } = useWizard()
  const { race } = state.data

  const races = loaderData?.races || []
  const raceChoices = getChoicesForStep('race')

  const selectedRaceData = race ? races.find(r => r.id === race.id) : null

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
                  <p className="text-muted italic">Escolha entre os atributos abaixo</p>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{ability.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      ability.type === 'active' ? 'bg-accent/20 text-accent' : 'bg-card-muted text-muted'
                    }`}>
                      {ability.type === 'active' ? 'Ativa' : 'Passiva'}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">{ability.description}</p>
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
    </div>
  )
}
