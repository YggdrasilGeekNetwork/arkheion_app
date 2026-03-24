import { useState, useMemo } from 'react'
import { useWizard } from '~/contexts/WizardContext'
import { InlineChoiceResolver } from '../ChoiceResolver'
import { checkPowerEligibility, buildIneligiblePowerOptions } from '~/lib/powerEligibility'
import type { PowerPrerequisite, AttributeValues, OriginItem } from '~/types/wizard'

// ── PowerList ─────────────────────────────────────────────────────────────────

type Power = {
  id: string
  name: string
  description?: string
  prerequisites?: PowerPrerequisite[]
}

function PowerList({
  powers,
  attributes,
  racialBonuses,
  totalLevel,
}: {
  powers: Power[]
  attributes: AttributeValues
  racialBonuses: Array<{ attribute: string; value: number }>
  totalLevel: number
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div>
      <h4 className="text-xs font-medium text-muted mb-1">Poderes</h4>
      <div className="space-y-1">
        {powers.map(power => {
          const { eligible, reason } = checkPowerEligibility(power.prerequisites, attributes, racialBonuses, totalLevel)
          return (
            <button
              key={power.id}
              type="button"
              onClick={() => setExpanded(expanded === power.id ? null : power.id)}
              className={`w-full text-left px-3 py-2 border rounded-lg transition-colors ${
                eligible
                  ? 'bg-card border-stroke hover:border-accent/50'
                  : 'bg-card border-stroke opacity-45'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium">{power.name}</span>
                  {!eligible && (
                    <span className="text-xs text-red-400 flex-shrink-0">✕</span>
                  )}
                </div>
                {(power.description || reason) && (
                  <span className="text-muted text-xs flex-shrink-0">{expanded === power.id ? '▲' : '▼'}</span>
                )}
              </div>
              {expanded === power.id && (
                <div className="mt-1.5 space-y-1">
                  {!eligible && reason && (
                    <p className="text-xs text-red-400">{reason}</p>
                  )}
                  {power.description && (
                    <p className="text-xs text-muted leading-relaxed">{power.description}</p>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── OriginStep ────────────────────────────────────────────────────────────────

export default function OriginStep() {
  const { state, loaderData, selectOrigin, getChoicesForStep, resolveChoice } = useWizard()
  const { origin, attributes } = state.data
  const racialBonuses = state.computed.attributeBonuses
  const totalLevel = state.computed.totalLevel || 1

  const origins = loaderData?.origins || []
  const selectedOriginData = origin ? origins.find(o => o.id === origin.id) : null
  const originChoices = getChoicesForStep('origin')

  const ineligibleOptionsByChoice = useMemo(
    () => buildIneligiblePowerOptions(originChoices, attributes, racialBonuses, totalLevel),
    [originChoices, attributes, racialBonuses, totalLevel]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Origem</h2>
        <p className="text-sm text-muted">
          Escolha a origem do seu personagem. A origem define o que você fazia antes de se tornar um aventureiro.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Origem <span className="text-muted text-xs">(opcional)</span>
        </label>
        <select
          value={origin?.id || ''}
          onChange={(e) => {
            const selected = origins.find(o => o.id === e.target.value)
            selectOrigin(e.target.value || null, selected)
          }}
          className="w-full px-3 py-2 bg-card-muted border border-stroke rounded-lg focus:border-accent focus:outline-none"
        >
          <option value="">Nenhuma</option>
          {origins.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        {selectedOriginData && (
          <p className="mt-1 text-xs text-muted">{selectedOriginData.description}</p>
        )}
      </div>

      {selectedOriginData && (
        <div className="bg-card-muted border border-stroke rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold">Benefícios da Origem</h3>

          {selectedOriginData.specialNote ? (
            <p className="text-sm text-muted">{selectedOriginData.specialNote}</p>
          ) : (
            <>
              {selectedOriginData.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted mb-1">Perícias</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOriginData.skills.map(skill => (
                      <span key={skill} className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(selectedOriginData.items ?? []).length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted mb-1">Itens Iniciais</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedOriginData.items as OriginItem[]).map((item, i) => (
                      item.type === 'fixed' ? (
                        <span key={i} className="text-xs bg-card border border-stroke text-muted px-2 py-1 rounded">
                          {item.quantity && item.quantity > 1 ? `${item.text} ×${item.quantity}` : item.text}
                        </span>
                      ) : (
                        <span key={i} className="text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded">
                          {item.text} <span className="opacity-70">(escolha no passo Equipamento)</span>
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              {selectedOriginData.powers.length > 0 && (
                <PowerList
                  powers={selectedOriginData.powers}
                  attributes={attributes}
                  racialBonuses={racialBonuses}
                  totalLevel={totalLevel}
                />
              )}
            </>
          )}
        </div>
      )}

      {originChoices.length > 0 && (
        <InlineChoiceResolver
          choices={originChoices}
          onResolve={resolveChoice}
          ineligibleOptionsByChoice={ineligibleOptionsByChoice}
        />
      )}
    </div>
  )
}
