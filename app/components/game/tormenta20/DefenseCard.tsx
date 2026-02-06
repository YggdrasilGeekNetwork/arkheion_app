import { useState } from 'react'
import Card from '~/components/ui/Card'

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
        <div className="flex items-center gap-1.5">
          <div className="text-sm font-semibold">Defesa</div>
          <select
            value={selectedAttr}
            onChange={(e) => setSelectedAttr(e.target.value)}
            className="w-15 px-1 py-0.5 text-xs bg-btn-bg border border-stroke rounded"
          >
            {attributes.map((attr) => (
              <option key={attr.label} value={attr.label}>
                {attr.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-lg font-bold">{totalDefense}</div>
      </div>

      {/* Breakdown */}
      <div className="text-[10px] text-muted space-y-0">
        < >
          <span>10 + {selectedAttr}({attrModifier >= 0 ? '+' : ''}{attrModifier})</span>
        </>
        {armor > 0 && (
          <>
            <span> + Armadura</span>
            <span> (+{armor})</span>
          </>
        )}
        {shield > 0 && (
          <>
            <span> + Escudo</span>
            <span> (+{shield})</span>
          </>
        )}
        {others !== 0 && (
          <div className="justify-left group relative cursor-help leading-tight inline">
            <span> + Outros {othersDetails.length > 0 && <span className="text-[9px] opacity-50">?</span>}</span>
            <span> ({others >= 0 ? '+' : ''}{others})</span>
            {othersDetails.length > 0 && (
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-card border border-stroke rounded-lg p-1.5 shadow-lg z-10 w-40">
                <div className="text-[10px] font-semibold mb-0.5">Detalhes:</div>
                {othersDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between text-[10px] leading-tight">
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
