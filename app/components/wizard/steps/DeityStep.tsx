import { useState } from 'react'
import { useWizard } from '~/contexts/WizardContext'
import type { DeityData, DeityPower } from '~/types/wizard'

// Pantheon option for those who don't want a specific deity
const PANTHEON_OPTION = {
  id: 'panteao',
  name: 'Panteão',
  description: 'Você é devoto de todos os deuses, servindo ao equilíbrio divino.',
}

export default function DeityStep() {
  const { state, dispatch, loaderData } = useWizard()
  const { deity, selectedPowers, classes: selectedClasses } = state.data

  const deities = loaderData?.deities || []
  const allClasses = loaderData?.classes || []

  const [expandedPower, setExpandedPower] = useState<string | null>(null)

  // Classes with "Devoto" ability require a deity or pantheon selection
  const classesWithDevoto = selectedClasses.filter(cls => {
    const classData = allClasses.find(c => c.id === cls.id)
    return classData?.abilities.some(
      ability => ability.name.toLowerCase().includes('devoto')
    )
  })

  const hasDevoto = classesWithDevoto.length > 0
  const requiresDeityOrPantheon = hasDevoto

  // Number of powers the character can select
  const maxPowers = hasDevoto ? 2 : 1

  const selectedDeity = deity && deity.id !== 'panteao'
    ? deities.find(d => d.id === deity.id)
    : null

  const isPantheonSelected = deity?.id === 'panteao'

  const handleSelectDeity = (deityData: DeityData | typeof PANTHEON_OPTION) => {
    if (deity?.id === deityData.id) {
      if (!requiresDeityOrPantheon) {
        dispatch({ type: 'SELECT_DEITY', payload: null })
      }
    } else {
      dispatch({ type: 'SELECT_DEITY', payload: { id: deityData.id, name: deityData.name } })
    }
  }

  const handleSelectNone = () => {
    if (!requiresDeityOrPantheon) {
      dispatch({ type: 'SELECT_DEITY', payload: null })
    }
  }

  const handleTogglePower = (powerId: string) => {
    if (selectedPowers.includes(powerId)) {
      dispatch({
        type: 'SET_SELECTED_POWERS',
        payload: selectedPowers.filter(p => p !== powerId),
      })
    } else if (selectedPowers.length < maxPowers) {
      dispatch({
        type: 'SET_SELECTED_POWERS',
        payload: [...selectedPowers, powerId],
      })
    }
  }

  const PowerCard = ({ power, isSelected }: { power: DeityPower; isSelected: boolean }) => {
    const isExpanded = expandedPower === power.id
    const canSelect = isSelected || selectedPowers.length < maxPowers

    return (
      <div
        className={`bg-card border-2 rounded-lg overflow-hidden transition-all ${
          isSelected
            ? 'border-accent bg-accent/5'
            : canSelect
            ? 'border-stroke hover:border-accent/50'
            : 'border-stroke opacity-50'
        }`}
      >
        <div className="p-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => canSelect && handleTogglePower(power.id)}
              disabled={!canSelect}
              className={`mt-1 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-accent border-accent'
                  : canSelect
                  ? 'border-stroke hover:border-accent'
                  : 'border-stroke cursor-not-allowed'
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{power.name}</span>
                {power.type && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    power.type === 'active'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-card-muted text-muted'
                  }`}>
                    {power.type === 'active' ? 'Ativa' : 'Passiva'}
                  </span>
                )}
                {power.cost?.pm && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    {power.cost.pm} PM
                  </span>
                )}
              </div>

              {power.description && (
                <button
                  type="button"
                  onClick={() => setExpandedPower(isExpanded ? null : power.id)}
                  className="text-sm text-muted hover:text-text mt-1 flex items-center gap-1 w-full text-left"
                >
                  <span className={isExpanded ? '' : 'line-clamp-1'}>
                    {power.description}
                  </span>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Divindade</h2>
        <p className="text-sm text-muted">
          {requiresDeityOrPantheon ? (
            <>
              Sua classe requer devoção divina. Escolha uma divindade específica ou seja devoto do Panteão.
              {hasDevoto && ' Como devoto, você pode escolher até 2 poderes concedidos.'}
            </>
          ) : (
            <>
              Escolha uma divindade para seu personagem seguir (opcional).
              {hasDevoto
                ? ' Como devoto, você pode escolher até 2 poderes concedidos.'
                : ' Você pode escolher 1 poder concedido.'}
            </>
          )}
        </p>
      </div>

      {/* Required deity warning */}
      {requiresDeityOrPantheon && !deity && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-500">
          <strong>Atenção:</strong> Sua classe ({classesWithDevoto.map(c => c.name).join(', ')}) requer que você escolha uma divindade ou seja devoto do Panteão.
        </div>
      )}

      {/* Deity Selection */}
      <div className="grid gap-3 sm:grid-cols-2">
        {deities.map((d) => {
          const isSelected = deity?.id === d.id

          return (
            <button
              key={d.id}
              type="button"
              onClick={() => handleSelectDeity(d)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-stroke bg-card hover:border-accent/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-card-muted flex items-center justify-center text-xl flex-shrink-0">
                  {d.energy === 'positiva' ? '☀️' : '🌙'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{d.name}</h3>
                    {isSelected && (
                      <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                        Selecionada
                      </span>
                    )}
                  </div>
                  {d.title && <p className="text-xs text-accent">{d.title}</p>}
                  <p className="text-xs text-muted line-clamp-2 mt-0.5">{d.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Pantheon option */}
      <button
        type="button"
        onClick={() => handleSelectDeity(PANTHEON_OPTION)}
        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
          isPantheonSelected
            ? 'border-accent bg-accent/10'
            : 'border-stroke bg-card hover:border-accent/50'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-card-muted flex items-center justify-center text-xl">
            🌟
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{PANTHEON_OPTION.name}</h3>
              {isPantheonSelected && (
                <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                  Selecionado
                </span>
              )}
            </div>
            <p className="text-xs text-muted">{PANTHEON_OPTION.description}</p>
          </div>
        </div>
      </button>

      {/* No deity option */}
      {!requiresDeityOrPantheon && (
        <button
          type="button"
          onClick={handleSelectNone}
          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
            !deity
              ? 'border-accent bg-accent/10'
              : 'border-stroke bg-card hover:border-accent/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-card-muted flex items-center justify-center text-xl">
              ⚪
            </div>
            <div>
              <h3 className="font-semibold">Sem Divindade</h3>
              <p className="text-xs text-muted">Seu personagem não segue nenhuma divindade específica</p>
            </div>
          </div>
        </button>
      )}

      {/* Selected Deity Details */}
      {selectedDeity && (
        <div className="bg-card border border-stroke rounded-lg overflow-hidden">
          <div className="bg-card-muted px-4 py-3 border-b border-stroke">
            <h3 className="font-semibold">{selectedDeity.name}</h3>
            {selectedDeity.title && <p className="text-sm text-muted">{selectedDeity.title}</p>}
          </div>

          <div className="p-4 space-y-4">
            {/* Description / Beliefs */}
            {selectedDeity.beliefsObjectives && (
              <div>
                <h4 className="text-sm font-medium text-muted mb-1">Valores e Objetivos</h4>
                <p className="text-sm">{selectedDeity.beliefsObjectives}</p>
              </div>
            )}

            {/* Energy & Weapon */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted mb-1">Energia</h4>
                <span className={`inline-flex items-center gap-1 text-sm ${
                  selectedDeity.energy === 'positiva' ? 'text-yellow-500' : 'text-purple-500'
                }`}>
                  {selectedDeity.energy === 'positiva' ? '☀️' : '🌙'}
                  {selectedDeity.energy === 'positiva' ? 'Positiva' : selectedDeity.energy === 'negativa' ? 'Negativa' : selectedDeity.energy}
                </span>
              </div>
              {selectedDeity.preferredWeapon && (
                <div>
                  <h4 className="text-sm font-medium text-muted mb-1">Arma Favorita</h4>
                  <p className="text-sm">{selectedDeity.preferredWeapon}</p>
                </div>
              )}
            </div>

            {/* Obligations & Restrictions */}
            {selectedDeity.obligationsRestrictions && (
              <div>
                <h4 className="text-sm font-medium text-muted mb-1">Obrigações & Restrições</h4>
                <p className="text-sm text-muted whitespace-pre-line">{selectedDeity.obligationsRestrictions}</p>
              </div>
            )}

            {/* Granted Powers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted">Poderes Concedidos</h4>
                <span className={`text-sm ${
                  selectedPowers.length === maxPowers ? 'text-accent' : 'text-muted'
                }`}>
                  {selectedPowers.length}/{maxPowers} selecionados
                </span>
              </div>
              <div className="space-y-2">
                {selectedDeity.grantedPowers.map(power => (
                  <PowerCard
                    key={power.id}
                    power={power}
                    isSelected={selectedPowers.includes(power.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pantheon Details */}
      {isPantheonSelected && (
        <div className="bg-card border border-stroke rounded-lg overflow-hidden">
          <div className="bg-card-muted px-4 py-3 border-b border-stroke">
            <h3 className="font-semibold">Devoto do Panteão</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted">
              Como devoto do Panteão, você serve a todos os deuses de Arton igualmente.
              Você pode canalizar energia positiva ou negativa conforme a necessidade.
              Sua única Obrigação & Restrição é não usar armas cortantes ou perfurantes.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {deity && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Resumo</h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted">Devoção:</span>{' '}
              <span className="font-medium">{deity.name}</span>
            </p>
            {selectedPowers.length > 0 && selectedDeity && (
              <p>
                <span className="text-muted">Poderes:</span>{' '}
                <span className="font-medium">
                  {selectedPowers
                    .map(id => selectedDeity.grantedPowers.find(p => p.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-card-muted border border-stroke rounded-lg p-3 text-xs text-muted">
        <strong>Nota:</strong> Seguidores de uma divindade devem respeitar suas obrigações e restrições.
        Violar esses preceitos pode resultar na perda de poderes divinos.
      </div>
    </div>
  )
}
