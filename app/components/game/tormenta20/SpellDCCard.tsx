import { useState } from 'react'

type SpellDCCardProps = {
  attributes: { label: string; modifier: number }[]
  hasSpells?: boolean
  proficiencyBonus?: number
}

const SpellDCCard = ({ attributes, hasSpells = true, proficiencyBonus = 2 }: SpellDCCardProps) => {
  const [selectedAttr, setSelectedAttr] = useState('INT')

  const selectedAttribute = attributes.find((attr) => attr.label === selectedAttr)
  const attrModifier = selectedAttribute ? selectedAttribute.modifier : 0
  const baseDC = 10
  const totalDC = baseDC + proficiencyBonus + attrModifier

  const title = hasSpells ? 'CD Magias' : 'CD Habilidades'

  return (
    <div className="relative group bg-card border border-stroke rounded-lg p-2">
      <div className="flex items-center justify-between text-xs md:text-sm min-h-[20px] md:min-h-[24px]">
        <span className="font-semibold text-muted whitespace-nowrap">{title} <span className="opacity-50">?</span></span>
        <div className="flex items-center gap-1.5">
          <select
            value={selectedAttr}
            onChange={(e) => setSelectedAttr(e.target.value)}
            className="px-1.5 py-0.5 text-xs md:text-sm bg-btn-bg border border-stroke rounded leading-none w-14 md:w-16"
          >
            {attributes.map((attr) => (
              <option key={attr.label} value={attr.label}>
                {attr.label}
              </option>
            ))}
          </select>
          <span className="font-bold text-base md:text-lg">{totalDC}</span>
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
        <div className="text-xs font-semibold mb-1">Detalhes:</div>
        <div className="text-xs space-y-0.5">
          <div className="flex justify-between">
            <span>Base:</span>
            <span>{baseDC}</span>
          </div>
          <div className="flex justify-between">
            <span>Proficiência:</span>
            <span>+{proficiencyBonus}</span>
          </div>
          <div className="flex justify-between">
            <span>{selectedAttr}:</span>
            <span>{attrModifier >= 0 ? '+' : ''}{attrModifier}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpellDCCard
