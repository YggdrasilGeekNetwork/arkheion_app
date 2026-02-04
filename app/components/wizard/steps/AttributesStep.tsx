import { useWizard } from '~/contexts/WizardContext'
import type { AttributeValues } from '~/types/wizard'

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
const ATTRIBUTE_LABELS: Record<keyof AttributeValues, { name: string; description: string }> = {
  FOR: { name: 'Força', description: 'Poder físico, capacidade de carregar peso e dano corpo a corpo' },
  DES: { name: 'Destreza', description: 'Agilidade, reflexos e precisão' },
  CON: { name: 'Constituição', description: 'Resistência física, vitalidade e pontos de vida' },
  INT: { name: 'Inteligência', description: 'Raciocínio, memória e conhecimento' },
  SAB: { name: 'Sabedoria', description: 'Percepção, intuição e força de vontade' },
  CAR: { name: 'Carisma', description: 'Presença, liderança e força de personalidade' },
}

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}

function calculateModifier(value: number): number {
  return Math.floor((value - 10) / 2)
}

function getPointCost(value: number): number {
  if (value <= 8) return 0
  if (value >= 15) return POINT_BUY_COSTS[15] + (value - 15) * 2
  return POINT_BUY_COSTS[value] || 0
}

export default function AttributesStep() {
  const { state, dispatch, getPointBuyRemaining } = useWizard()
  const { attributeMethod, attributes } = state.data
  const racialBonuses = state.computed.attributeBonuses

  const pointsRemaining = getPointBuyRemaining()
  const totalPointsUsed = 27 - pointsRemaining

  const handleMethodChange = (method: typeof attributeMethod) => {
    dispatch({ type: 'SET_ATTRIBUTE_METHOD', payload: method })

    // Reset to default values when switching methods
    if (method === 'standard-array') {
      // Don't auto-assign, let user choose
    } else if (method === 'point-buy') {
      dispatch({
        type: 'SET_ATTRIBUTES',
        payload: { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
      })
    }
  }

  const handleAttributeChange = (attr: keyof AttributeValues, value: number) => {
    dispatch({ type: 'SET_SINGLE_ATTRIBUTE', payload: { attribute: attr, value } })
  }

  const getRacialBonus = (attr: string): number => {
    return racialBonuses.find(b => b.attribute === attr)?.value || 0
  }

  const getFinalValue = (attr: keyof AttributeValues): number => {
    return attributes[attr] + getRacialBonus(attr)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Atributos</h2>
        <p className="text-sm text-muted">
          Os atributos definem as capacidades fundamentais do seu personagem.
        </p>
      </div>

      {/* Method Selection */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleMethodChange('point-buy')}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            attributeMethod === 'point-buy'
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-stroke bg-card hover:border-accent/50'
          }`}
        >
          Compra de Pontos
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('standard-array')}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            attributeMethod === 'standard-array'
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-stroke bg-card hover:border-accent/50'
          }`}
        >
          Array Padrão
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('manual')}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            attributeMethod === 'manual'
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-stroke bg-card hover:border-accent/50'
          }`}
        >
          Manual
        </button>
      </div>

      {/* Method explanation */}
      <div className="bg-card-muted border border-stroke rounded-lg p-3 text-sm text-muted">
        {attributeMethod === 'point-buy' && (
          <>
            <strong>Compra de Pontos:</strong> Você tem 27 pontos para distribuir. Valores custam:
            8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9. Valores acima de 15 custam +2 por ponto.
          </>
        )}
        {attributeMethod === 'standard-array' && (
          <>
            <strong>Array Padrão:</strong> Distribua os valores 15, 14, 13, 12, 10 e 8 entre os atributos.
          </>
        )}
        {attributeMethod === 'manual' && (
          <>
            <strong>Manual:</strong> Digite os valores diretamente (para usar rolagem de dados ou outra regra).
          </>
        )}
      </div>

      {/* Points counter for point buy */}
      {attributeMethod === 'point-buy' && (
        <div className={`text-center p-3 rounded-lg ${
          pointsRemaining < 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-accent/10 border border-accent/30'
        }`}>
          <span className="text-2xl font-bold">{pointsRemaining}</span>
          <span className="text-sm text-muted ml-2">pontos restantes</span>
          {pointsRemaining < 0 && (
            <p className="text-sm text-red-500 mt-1">Você excedeu o limite de pontos!</p>
          )}
        </div>
      )}

      {/* Attributes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(ATTRIBUTE_LABELS) as Array<keyof AttributeValues>).map(attr => {
          const racialBonus = getRacialBonus(attr)
          const finalValue = getFinalValue(attr)
          const modifier = calculateModifier(finalValue)
          const cost = getPointCost(attributes[attr])

          return (
            <div
              key={attr}
              className="bg-card border border-stroke rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-lg">{attr}</span>
                  <span className="text-sm text-muted ml-2">{ATTRIBUTE_LABELS[attr].name}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{finalValue}</div>
                  <div className={`text-sm ${modifier >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted mb-3">{ATTRIBUTE_LABELS[attr].description}</p>

              <div className="flex items-center gap-2">
                {attributeMethod === 'point-buy' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAttributeChange(attr, Math.max(8, attributes[attr] - 1))}
                      disabled={attributes[attr] <= 8}
                      className="w-8 h-8 rounded bg-card-muted hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-lg font-medium">{attributes[attr]}</span>
                      {racialBonus > 0 && (
                        <span className="text-accent ml-1">+{racialBonus}</span>
                      )}
                      <div className="text-xs text-muted">Custo: {cost}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAttributeChange(attr, Math.min(18, attributes[attr] + 1))}
                      disabled={attributes[attr] >= 18 || pointsRemaining <= 0}
                      className="w-8 h-8 rounded bg-card-muted hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      +
                    </button>
                  </>
                )}

                {attributeMethod === 'standard-array' && (
                  <select
                    value={attributes[attr]}
                    onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                  >
                    <option value={8}>8</option>
                    {STANDARD_ARRAY.map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                )}

                {attributeMethod === 'manual' && (
                  <input
                    type="number"
                    value={attributes[attr]}
                    onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value) || 10)}
                    min={1}
                    max={30}
                    className="flex-1 px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none text-center"
                  />
                )}

                {racialBonus > 0 && attributeMethod !== 'point-buy' && (
                  <span className="text-accent text-sm">+{racialBonus}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-card-muted border border-stroke rounded-lg p-4">
        <h3 className="font-semibold mb-2">Resumo dos Modificadores</h3>
        <div className="flex flex-wrap gap-4">
          {(Object.keys(ATTRIBUTE_LABELS) as Array<keyof AttributeValues>).map(attr => {
            const finalValue = getFinalValue(attr)
            const modifier = calculateModifier(finalValue)
            return (
              <div key={attr} className="text-center">
                <div className="text-xs text-muted">{attr}</div>
                <div className={`text-lg font-bold ${modifier >= 0 ? 'text-accent' : 'text-red-500'}`}>
                  {modifier >= 0 ? '+' : ''}{modifier}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
