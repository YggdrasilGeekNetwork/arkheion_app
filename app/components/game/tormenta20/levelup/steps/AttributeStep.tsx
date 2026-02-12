import type { Attribute } from '~/types/character'
import { getModifierFromValue } from '~/types/levelup'

type AttributeStepProps = {
  attributes: Attribute[]
  selectedAttribute: string | null
  newTotalLevel: number
  onSelectAttribute: (attribute: string | null) => void
}

export default function AttributeStep({
  attributes,
  selectedAttribute,
  newTotalLevel,
  onSelectAttribute,
}: AttributeStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Aumento de Atributo</h3>
        <p className="text-sm text-muted mb-4">
          Ao atingir o nível {newTotalLevel}, você ganha +1 em um atributo à sua escolha.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {attributes.map(attr => {
          const isSelected = selectedAttribute === attr.label
          const newValue = attr.value + (isSelected ? 1 : 0)
          const newModifier = getModifierFromValue(newValue)
          const modifierChanged = newModifier !== attr.modifier

          return (
            <button
              key={attr.label}
              onClick={() => onSelectAttribute(isSelected ? null : attr.label)}
              className={`p-4 rounded-lg border text-center transition-all ${
                isSelected
                  ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                  : 'border-stroke bg-card hover:border-accent/50'
              }`}
            >
              <div className="text-sm font-semibold text-muted mb-1">
                {attr.label}
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{attr.value}</span>
                {isSelected && (
                  <>
                    <span className="text-accent">→</span>
                    <span className="text-lg font-bold text-accent">{newValue}</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center gap-1 mt-1">
                <span className={`text-sm ${isSelected && modifierChanged ? 'text-muted line-through' : ''}`}>
                  {attr.modifier >= 0 ? '+' : ''}{attr.modifier}
                </span>
                {isSelected && modifierChanged && (
                  <>
                    <span className="text-accent text-sm">→</span>
                    <span className="text-sm font-bold text-accent">
                      {newModifier >= 0 ? '+' : ''}{newModifier}
                    </span>
                  </>
                )}
              </div>

              {isSelected && modifierChanged && (
                <div className="text-xs text-accent mt-2">
                  Modificador aumenta!
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedAttribute && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="text-sm text-green-400">
            <strong>{selectedAttribute}</strong> será aumentado de{' '}
            {attributes.find(a => a.label === selectedAttribute)?.value} para{' '}
            {(attributes.find(a => a.label === selectedAttribute)?.value ?? 0) + 1}
          </div>
        </div>
      )}
    </div>
  )
}
