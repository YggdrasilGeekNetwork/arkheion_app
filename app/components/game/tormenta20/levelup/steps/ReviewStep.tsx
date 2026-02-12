import type { Ability, Attribute } from '~/types/character'
import { getModifierFromValue } from '~/types/levelup'

type ReviewStepProps = {
  className: string
  previousLevel: number
  newLevel: number
  newTotalLevel: number
  hpGained: number
  mpGained: number
  attributeIncrease: string | null
  attributes: Attribute[]
  selectedAbilities: Ability[]
  selectedSkills: string[]
}

export default function ReviewStep({
  className,
  previousLevel,
  newLevel,
  newTotalLevel,
  hpGained,
  mpGained,
  attributeIncrease,
  attributes,
  selectedAbilities,
  selectedSkills,
}: ReviewStepProps) {
  const getAttributeChange = () => {
    if (!attributeIncrease) return null
    const attr = attributes.find(a => a.label === attributeIncrease)
    if (!attr) return null

    const newValue = attr.value + 1
    const newModifier = getModifierFromValue(newValue)

    return {
      label: attributeIncrease,
      oldValue: attr.value,
      newValue,
      oldModifier: attr.modifier,
      newModifier,
      modifierChanged: newModifier !== attr.modifier,
    }
  }

  const attributeChange = getAttributeChange()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Confirmar Level Up</h3>
        <p className="text-sm text-muted mb-4">
          Revise as mudanças antes de confirmar.
        </p>
      </div>

      {/* Level Summary */}
      <div className="p-4 bg-card-muted rounded-lg border border-stroke">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted">Classe</div>
            <div className="font-bold text-lg">{className}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted">Nível</div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{previousLevel}</span>
              <span className="text-accent">→</span>
              <span className="text-lg font-bold text-accent">{newLevel}</span>
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-stroke text-sm text-muted text-center">
          Nível Total: {newTotalLevel}
        </div>
      </div>

      {/* Stats Gained */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <div className="text-xs text-muted mb-1">Pontos de Vida</div>
          <div className="text-2xl font-bold text-green-500">+{hpGained}</div>
        </div>
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
          <div className="text-xs text-muted mb-1">Pontos de Mana</div>
          <div className="text-2xl font-bold text-blue-500">+{mpGained}</div>
        </div>
      </div>

      {/* Attribute Increase */}
      {attributeChange && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="text-xs text-muted mb-2">Aumento de Atributo</div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{attributeChange.label}</span>
            <div className="flex items-center gap-2">
              <span>{attributeChange.oldValue}</span>
              <span className="text-purple-400">→</span>
              <span className="font-bold text-purple-400">{attributeChange.newValue}</span>
              {attributeChange.modifierChanged && (
                <span className="text-xs text-purple-400 ml-2">
                  (mod: {attributeChange.oldModifier >= 0 ? '+' : ''}{attributeChange.oldModifier} →{' '}
                  {attributeChange.newModifier >= 0 ? '+' : ''}{attributeChange.newModifier})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Abilities */}
      {selectedAbilities.length > 0 && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="text-xs text-muted mb-2">Novas Habilidades</div>
          <div className="space-y-2">
            {selectedAbilities.map(ability => (
              <div key={ability.id} className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <div>
                  <span className="font-semibold">{ability.name}</span>
                  <span className="text-xs text-muted ml-2">
                    ({ability.type === 'passive' ? 'Passiva' : 'Ativa'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {selectedSkills.length > 0 && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <div className="text-xs text-muted mb-2">Novas Perícias Treinadas</div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skill => (
              <span
                key={skill}
                className="px-2 py-1 bg-cyan-500/20 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Message */}
      <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg text-center">
        <div className="text-sm">
          Clique em <strong>Confirmar</strong> para aplicar as mudanças.
        </div>
      </div>
    </div>
  )
}
