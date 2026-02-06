import { useState } from 'react'
import { useWizard } from '~/contexts/WizardContext'
import type { AttributeValues } from '~/types/wizard'

// Tormenta 20: Standard array adapted for modifier system
// Total cost: 3(4) + 2(2) + 1(1) + 1(1) + 0(0) + (-1)(-1) = 7 points
const STANDARD_ARRAY = [3, 2, 1, 1, 0, -1]

const ATTRIBUTE_LABELS: Record<keyof AttributeValues, { name: string; description: string }> = {
  FOR: { name: 'Força', description: 'Poder físico, capacidade de carregar peso e dano corpo a corpo' },
  DES: { name: 'Destreza', description: 'Agilidade, reflexos e precisão' },
  CON: { name: 'Constituição', description: 'Resistência física, vitalidade e pontos de vida' },
  INT: { name: 'Inteligência', description: 'Raciocínio, memória e conhecimento' },
  SAB: { name: 'Sabedoria', description: 'Percepção, intuição e força de vontade' },
  CAR: { name: 'Carisma', description: 'Presença, liderança e força de personalidade' },
}

// Tormenta 20 point costs
// -1 gives +1 point back, 0 = 0, 1 = 1, 2 = 2, 3 = 4, 4 = 7
const POINT_BUY_COSTS: Record<number, number> = {
  [-2]: -2,
  [-1]: -1,
  0: 0,
  1: 1,
  2: 2,
  3: 4,
  4: 7,
}

function getPointCost(value: number): number {
  const clampedValue = Math.max(-2, Math.min(4, value))
  return POINT_BUY_COSTS[clampedValue] ?? 0
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

// Roll 4d6, drop lowest
function roll4d6DropLowest(): number {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
  rolls.sort((a, b) => b - a)
  const total = rolls[0] + rolls[1] + rolls[2]
  // Convert D&D-style score to Tormenta 20 modifier
  // Using the table: 7- = -2, 8-9 = -1, 10-11 = 0, 12-13 = 1, 14-15 = 2, 16-17 = 3, 18 = 4
  if (total <= 7) return -2
  if (total <= 9) return -1
  if (total <= 11) return 0
  if (total <= 13) return 1
  if (total <= 15) return 2
  if (total <= 17) return 3
  return 4
}

export default function AttributesStep() {
  const { state, dispatch, getPointBuyRemaining } = useWizard()
  const { attributeMethod, attributes } = state.data
  const racialBonuses = state.computed.attributeBonuses

  const pointsRemaining = getPointBuyRemaining()

  // State for rolled values in manual mode
  const [rolledValues, setRolledValues] = useState<number[]>([])
  const [assigningRoll, setAssigningRoll] = useState<number | null>(null)

  const handleMethodChange = (method: typeof attributeMethod) => {
    dispatch({ type: 'SET_ATTRIBUTE_METHOD', payload: method })

    // Reset to default values when switching methods
    if (method === 'point-buy') {
      dispatch({
        type: 'SET_ATTRIBUTES',
        payload: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
      })
    } else if (method === 'standard-array') {
      // Don't auto-assign, let user choose
      dispatch({
        type: 'SET_ATTRIBUTES',
        payload: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
      })
    } else if (method === 'manual') {
      dispatch({
        type: 'SET_ATTRIBUTES',
        payload: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
      })
      setRolledValues([])
      setAssigningRoll(null)
      setAssignedFromRolls(new Set())
    }
  }

  const handleAttributeChange = (attr: keyof AttributeValues, value: number) => {
    // Clamp to valid range
    const clampedValue = Math.max(-2, Math.min(4, value))
    dispatch({ type: 'SET_SINGLE_ATTRIBUTE', payload: { attribute: attr, value: clampedValue } })
  }

  // Handle standard array change with swap logic
  const handleStandardArrayChange = (attr: keyof AttributeValues, newValue: number) => {
    const currentValue = attributes[attr]

    // Find if another attribute is using this value
    const otherAttrUsingValue = (Object.keys(attributes) as Array<keyof AttributeValues>).find(
      a => a !== attr && attributes[a] === newValue
    )

    if (otherAttrUsingValue) {
      // Swap values between the two attributes
      dispatch({
        type: 'SET_ATTRIBUTES',
        payload: {
          ...attributes,
          [attr]: newValue,
          [otherAttrUsingValue]: currentValue,
        },
      })
    } else {
      // No swap needed, just set the value
      dispatch({ type: 'SET_SINGLE_ATTRIBUTE', payload: { attribute: attr, value: newValue } })
    }
  }

  // Get which attribute is using a specific value (for standard array labels)
  const getAttributeUsingValue = (value: number, excludeAttr: keyof AttributeValues): keyof AttributeValues | null => {
    return (Object.keys(attributes) as Array<keyof AttributeValues>).find(
      a => a !== excludeAttr && attributes[a] === value
    ) || null
  }

  // Count how many times a value appears in standard array
  const getValueCountInArray = (value: number): number => {
    return STANDARD_ARRAY.filter(v => v === value).length
  }

  // Count how many times a value is already assigned
  const getValueUsedCount = (value: number, excludeAttr?: keyof AttributeValues): number => {
    return (Object.keys(attributes) as Array<keyof AttributeValues>).filter(
      a => a !== excludeAttr && attributes[a] === value
    ).length
  }

  const getRacialBonus = (attr: string): number => {
    return racialBonuses.find(b => b.attribute === attr)?.value || 0
  }

  const getFinalValue = (attr: keyof AttributeValues): number => {
    return attributes[attr] + getRacialBonus(attr)
  }

  // Track which attributes have been assigned from rolls (to distinguish from manual edits)
  const [assignedFromRolls, setAssignedFromRolls] = useState<Set<keyof AttributeValues>>(new Set())

  // Roll all 6 attributes
  const handleRollAttributes = () => {
    const rolls = Array.from({ length: 6 }, () => roll4d6DropLowest())
    rolls.sort((a, b) => b - a)
    setRolledValues(rolls)
    setAssigningRoll(null)
    setAssignedFromRolls(new Set())
    dispatch({
      type: 'SET_ATTRIBUTES',
      payload: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
    })
  }

  // Assign a rolled value to an attribute
  const handleAssignRoll = (attr: keyof AttributeValues) => {
    if (assigningRoll === null || rolledValues.length === 0) return

    const valueToAssign = rolledValues[assigningRoll]
    let newRolledValues = [...rolledValues]
    newRolledValues.splice(assigningRoll, 1)

    // If this attribute already had a rolled value, return it to the pool
    if (assignedFromRolls.has(attr)) {
      const oldValue = attributes[attr]
      newRolledValues.push(oldValue)
      // Sort descending for consistency
      newRolledValues.sort((a, b) => b - a)
    }

    dispatch({ type: 'SET_SINGLE_ATTRIBUTE', payload: { attribute: attr, value: valueToAssign } })
    setRolledValues(newRolledValues)
    setAssignedFromRolls(prev => new Set([...prev, attr]))
    setAssigningRoll(null)
  }

  // Check if an attribute has been assigned from rolling
  const hasAssignedValue = (attr: keyof AttributeValues): boolean => {
    return assignedFromRolls.has(attr)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Atributos</h2>
        <p className="text-sm text-muted">
          Os atributos definem as capacidades fundamentais do seu personagem.
          Em Tormenta 20, os atributos são modificadores diretos, variando de -2 a +4.
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
          Rolagem / Manual
        </button>
      </div>

      {/* Method explanation */}
      <div className="bg-card-muted border border-stroke rounded-lg p-3 text-sm text-muted">
        {attributeMethod === 'point-buy' && (
          <>
            <strong>Compra de Pontos:</strong> Você tem 10 pontos para distribuir.
            Custos: -1 devolve 1 ponto, 0=0, +1=1, +2=2, +3=4, +4=7 pontos.
          </>
        )}
        {attributeMethod === 'standard-array' && (
          <>
            <strong>Array Padrão:</strong> Distribua os valores +3, +2, +1, +1, 0 e -1 entre os atributos.
            Selecionar um valor já em uso trocará automaticamente os valores entre os atributos.
          </>
        )}
        {attributeMethod === 'manual' && (
          <>
            <strong>Rolagem / Manual:</strong> Use o botão para rolar 4d6 (descarta o menor) e converter para
            modificadores, ou insira os valores diretamente.
          </>
        )}
      </div>

      {/* Points counter for point buy */}
      {attributeMethod === 'point-buy' && (
        <div className={`text-center p-3 rounded-lg ${
          pointsRemaining < 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-accent/10 border border-accent/30'
        }`}>
          <span className="text-2xl font-bold">{pointsRemaining}</span>
          <span className="text-sm text-muted ml-2">pontos restantes de 10</span>
          {pointsRemaining < 0 && (
            <p className="text-sm text-red-500 mt-1">Você excedeu o limite de pontos!</p>
          )}
        </div>
      )}

      {/* Roll button for manual mode */}
      {attributeMethod === 'manual' && (
        <div className="flex flex-col items-center gap-3 p-4 bg-card-muted border border-stroke rounded-lg">
          <button
            type="button"
            onClick={handleRollAttributes}
            className="px-6 py-3 bg-accent text-card font-semibold rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Rolar Atributos (4d6, descarta menor)
          </button>

          {rolledValues.length > 0 && (
            <div className="w-full">
              <p className="text-sm text-muted mb-2 text-center">
                Valores rolados (clique em um valor, depois clique no atributo para atribuir):
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {rolledValues.map((value, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAssigningRoll(assigningRoll === index ? null : index)}
                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                      assigningRoll === index
                        ? 'bg-accent text-card ring-2 ring-accent ring-offset-2 ring-offset-card'
                        : 'bg-card border border-stroke hover:border-accent'
                    }`}
                  >
                    {formatModifier(value)}
                  </button>
                ))}
              </div>
              {assigningRoll !== null && (
                <p className="text-sm text-accent text-center mt-2">
                  Clique em um atributo abaixo para atribuir {formatModifier(rolledValues[assigningRoll])}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Attributes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(ATTRIBUTE_LABELS) as Array<keyof AttributeValues>).map(attr => {
          const racialBonus = getRacialBonus(attr)
          const finalValue = getFinalValue(attr)
          const cost = getPointCost(attributes[attr])

          return (
            <div
              key={attr}
              className={`bg-card border rounded-lg p-4 transition-all ${
                assigningRoll !== null && attributeMethod === 'manual'
                  ? 'border-accent/50 hover:border-accent cursor-pointer'
                  : 'border-stroke'
              }`}
              onClick={() => {
                if (assigningRoll !== null && attributeMethod === 'manual') {
                  handleAssignRoll(attr)
                }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-lg">{attr}</span>
                  <span className="text-sm text-muted ml-2">{ATTRIBUTE_LABELS[attr].name}</span>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${finalValue >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    {formatModifier(finalValue)}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted mb-3">{ATTRIBUTE_LABELS[attr].description}</p>

              <div className="flex items-center gap-2">
                {attributeMethod === 'point-buy' && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAttributeChange(attr, attributes[attr] - 1)
                      }}
                      disabled={attributes[attr] <= -1}
                      className="w-8 h-8 rounded bg-card-muted hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <span className={`text-lg font-medium ${attributes[attr] >= 0 ? '' : 'text-red-500'}`}>
                        {formatModifier(attributes[attr])}
                      </span>
                      {racialBonus !== 0 && (
                        <span className={racialBonus > 0 ? 'text-accent ml-1' : 'text-red-500 ml-1'}>
                          {formatModifier(racialBonus)}
                        </span>
                      )}
                      <div className="text-xs text-muted">
                        Custo: {cost > 0 ? cost : cost === 0 ? '0' : `${cost} (devolve)`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAttributeChange(attr, attributes[attr] + 1)
                      }}
                      disabled={attributes[attr] >= 4}
                      className="w-8 h-8 rounded bg-card-muted hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      +
                    </button>
                  </>
                )}

                {attributeMethod === 'standard-array' && (() => {
                  // Get unique values from standard array
                  const uniqueValues = [...new Set(STANDARD_ARRAY)].sort((a, b) => b - a)

                  return (
                    <select
                      value={attributes[attr]}
                      onChange={(e) => handleStandardArrayChange(attr, parseInt(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                    >
                      <option value={0}>Selecione</option>
                      {uniqueValues.map(val => {
                        const totalInArray = getValueCountInArray(val)
                        const usedCount = getValueUsedCount(val, attr)
                        const availableCount = totalInArray - usedCount
                        const isCurrent = attributes[attr] === val
                        const usedByAttr = getAttributeUsingValue(val, attr)

                        let label = formatModifier(val)
                        if (isCurrent) {
                          // It's the current value
                        } else if (usedByAttr && availableCount === 0) {
                          // All instances used, show which attr uses it
                          label = `${formatModifier(val)} (${usedByAttr})`
                        } else if (totalInArray > 1 && usedCount > 0) {
                          // Some instances available
                          label = `${formatModifier(val)} (${availableCount}/${totalInArray} disponível)`
                        }

                        return (
                          <option
                            key={val}
                            value={val}
                          >
                            {label}
                          </option>
                        )
                      })}
                    </select>
                  )
                })()}

                {attributeMethod === 'manual' && (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      value={attributes[attr]}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleAttributeChange(attr, parseInt(e.target.value) || 0)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      min={-2}
                      max={4}
                      className="flex-1 px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none text-center"
                    />
                    {racialBonus !== 0 && (
                      <span className={racialBonus > 0 ? 'text-accent text-sm' : 'text-red-500 text-sm'}>
                        {formatModifier(racialBonus)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-card-muted border border-stroke rounded-lg p-4">
        <h3 className="font-semibold mb-2">Resumo dos Modificadores (com bônus raciais)</h3>
        <div className="flex flex-wrap gap-4">
          {(Object.keys(ATTRIBUTE_LABELS) as Array<keyof AttributeValues>).map(attr => {
            const finalValue = getFinalValue(attr)
            return (
              <div key={attr} className="text-center">
                <div className="text-xs text-muted">{attr}</div>
                <div className={`text-lg font-bold ${finalValue >= 0 ? 'text-accent' : 'text-red-500'}`}>
                  {formatModifier(finalValue)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cost table reference */}
      {attributeMethod === 'point-buy' && (
        <div className="bg-card-muted border border-stroke rounded-lg p-3 text-xs text-muted">
          <p className="font-semibold mb-1">Tabela de Custos:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>-1: devolve 1pt</span>
            <span>0: 0pt</span>
            <span>+1: 1pt</span>
            <span>+2: 2pts</span>
            <span>+3: 4pts</span>
            <span>+4: 7pts</span>
          </div>
        </div>
      )}
    </div>
  )
}
