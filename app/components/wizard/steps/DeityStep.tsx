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

  // Check if any selected class has the "devoto" ability or requires divine connection
  const classesWithDevoto = selectedClasses.filter(cls => {
    const classData = allClasses.find(c => c.id === cls.id)
    return classData?.abilities.some(
      ability => ability.name.toLowerCase().includes('devoto') ||
                 ability.name.toLowerCase().includes('poder divino') ||
                 ability.name.toLowerCase().includes('magia divina')
    )
  })

  const hasDevoto = classesWithDevoto.length > 0

  // Classes that REQUIRE a deity or pantheon selection
  const requiresDeityOrPantheon = selectedClasses.some(cls => {
    const classData = allClasses.find(c => c.id === cls.id)
    // Clérigo and similar classes require a deity/pantheon
    return classData?.abilities.some(
      ability => ability.name.toLowerCase().includes('magia divina') ||
                 ability.name.toLowerCase().includes('poder divino')
    )
  })

  // Number of powers the character can select
  const maxPowers = hasDevoto ? 2 : 1

  const selectedDeity = deity && deity.id !== 'panteao'
    ? deities.find(d => d.id === deity.id)
    : null

  const isPantheonSelected = deity?.id === 'panteao'

  const handleSelectDeity = (deityData: DeityData | typeof PANTHEON_OPTION) => {
    if (deity?.id === deityData.id) {
      // Deselect only if not required
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
      // Remove power
      dispatch({
        type: 'SET_SELECTED_POWERS',
        payload: selectedPowers.filter(p => p !== powerId),
      })
    } else if (selectedPowers.length < maxPowers) {
      // Add power
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
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  power.type === 'active'
                    ? 'bg-accent/20 text-accent'
                    : 'bg-card-muted text-muted'
                }`}>
                  {power.type === 'active' ? 'Ativa' : 'Passiva'}
                </span>
                {power.actionType && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    {power.actionType}
                  </span>
                )}
                {power.cost?.pm && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    {power.cost.pm} PM
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setExpandedPower(isExpanded ? null : power.id)}
                className="text-sm text-muted hover:text-text mt-1 flex items-center gap-1"
              >
                <span className={`line-clamp-1 ${isExpanded ? 'line-clamp-none' : ''}`}>
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
                  <p className="text-xs text-muted line-clamp-2">{d.description}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {d.domains.map(domain => (
                      <span key={domain} className="text-xs bg-card-muted px-1.5 py-0.5 rounded">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Pantheon option - for divine classes that want to serve all gods */}
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
            <p className="text-xs text-muted mt-1">
              Você não recebe poderes concedidos específicos, mas pode canalizar energia positiva ou negativa conforme a necessidade.
            </p>
          </div>
        </div>
      </button>

      {/* No deity option - only available if class doesn't require it */}
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
            <p className="text-sm text-muted">{selectedDeity.alignment}</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Values */}
            <div>
              <h4 className="text-sm font-medium text-muted mb-1">Valores</h4>
              <p className="text-sm">{selectedDeity.values}</p>
            </div>

            {/* Energy & Weapon */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted mb-1">Energia</h4>
                <span className={`inline-flex items-center gap-1 text-sm ${
                  selectedDeity.energy === 'positiva' ? 'text-yellow-500' : 'text-purple-500'
                }`}>
                  {selectedDeity.energy === 'positiva' ? '☀️' : '🌙'}
                  {selectedDeity.energy === 'positiva' ? 'Positiva' : 'Negativa'}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted mb-1">Arma Favorita</h4>
                <p className="text-sm">{selectedDeity.favoriteWeapon}</p>
              </div>
            </div>

            {/* Obligations */}
            <div>
              <h4 className="text-sm font-medium text-muted mb-1">Obrigações</h4>
              <ul className="text-sm space-y-1">
                {selectedDeity.obligations.map((obligation, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>{obligation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Restrictions */}
            <div>
              <h4 className="text-sm font-medium text-muted mb-1">Restrições</h4>
              <ul className="text-sm space-y-1">
                {selectedDeity.restrictions.map((restriction, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>

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
                {selectedDeity.powers.map(power => (
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
            <p className="text-sm text-muted">Neutro</p>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted mb-1">Descrição</h4>
              <p className="text-sm">
                Como devoto do Panteão, você serve a todos os deuses de Arton igualmente.
                Você busca manter o equilíbrio entre as forças divinas e pode invocar
                qualquer deus conforme a situação exigir.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted mb-1">Energia</h4>
                <span className="inline-flex items-center gap-1 text-sm text-muted">
                  ☀️/🌙 Positiva ou Negativa
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted mb-1">Arma Favorita</h4>
                <p className="text-sm">Qualquer</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted mb-1">Obrigações</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Respeitar todos os deuses igualmente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Manter o equilíbrio entre as forças divinas.</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted mb-1">Restrições</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Nunca desrespeitar ou profanar qualquer divindade.</span>
                </li>
              </ul>
            </div>

            <div className="bg-card-muted rounded-lg p-3 text-sm text-muted">
              <strong>Nota:</strong> Devotos do Panteão não escolhem poderes concedidos específicos.
              Em vez disso, você pode canalizar energia positiva ou negativa conforme a necessidade da situação.
            </div>
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
                    .map(id => selectedDeity.powers.find(p => p.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </p>
            )}
            {isPantheonSelected && (
              <p>
                <span className="text-muted">Energia:</span>{' '}
                <span className="font-medium">Positiva ou Negativa (à escolha)</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="bg-card-muted border border-stroke rounded-lg p-3 text-xs text-muted">
        <strong>Nota:</strong> Seguidores de uma divindade devem respeitar suas obrigações e restrições.
        Violar esses preceitos pode resultar na perda de poderes divinos.
      </div>
    </div>
  )
}
