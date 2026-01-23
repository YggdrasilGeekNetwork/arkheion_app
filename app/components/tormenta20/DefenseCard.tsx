import { useState } from 'react'
import Card from './Card'

type DefenseCardProps = {
  attributes: { label: string; modifier: number }[]
  armor?: number
  shield?: number
  others?: number
  othersDetails?: { label: string; value: number }[]
}

const DefenseCard = ({ attributes, armor = 0, shield = 0, others = 0, othersDetails = [] }: DefenseCardProps) => {
  const [selectedAttr, setSelectedAttr] = useState('DES')

  const selectedAttribute = attributes.find((attr) => attr.label === selectedAttr)
  const attrModifier = selectedAttribute ? selectedAttribute.modifier : 0

  const baseDefense = 10
  const totalDefense = baseDefense + attrModifier + armor + shield + others

  return (
    <Card>
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-2">
          <div className="text-m font-semibold">Defesa</div>
          <select
            value={selectedAttr}
            onChange={(e) => setSelectedAttr(e.target.value)}
            className="w-16 px-1.5 py-0.5 text-xs bg-btn-bg border border-stroke rounded"
          >
            {attributes.map((attr) => (
              <option key={attr.label} value={attr.label}>
                {attr.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xl font-bold">{totalDefense}</div>
      </div>

      {/* Breakdown */}
      <div className="text-xs text-muted space-y-0.5">
        <div className="flex justify-between">
          <span>10 + {selectedAttr}({attrModifier >= 0 ? '+' : ''}{attrModifier})</span>
          <span>{baseDefense + attrModifier}</span>
        </div>
        {armor > 0 && (
          <div className="flex justify-between">
            <span>+ Armadura</span>
            <span>+{armor}</span>
          </div>
        )}
        {shield > 0 && (
          <div className="flex justify-between">
            <span>+ Escudo</span>
            <span>+{shield}</span>
          </div>
        )}
        {others !== 0 && (
          <div className="flex justify-between group relative cursor-help">
            <span>+ Outros {othersDetails.length > 0 && <span className="text-xs opacity-50">?</span>}</span>
            <span>{others >= 0 ? '+' : ''}{others}</span>
            {othersDetails.length > 0 && (
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
                <div className="text-xs font-semibold mb-1">Detalhes:</div>
                {othersDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{detail.label}:</span>
                    <span>{detail.value >= 0 ? '+' : ''}{detail.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default DefenseCard
