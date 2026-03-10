import Tooltip from '~/components/ui/Tooltip'

type SpellDCCardProps = {
  spellSaveDc: number
  tooltip?: string
  notes?: string[]
}

const SpellDCCard = ({ spellSaveDc, tooltip, notes = [] }: SpellDCCardProps) => {
  const tooltipContent = tooltip ?? '10 + modificador do atributo de conjuração'
  const fullContent = notes.length > 0
    ? `${tooltipContent}\n${notes.join('\n')}`
    : tooltipContent

  return (
    <Tooltip content={fullContent} className="cursor-help">
      <div className="bg-card border border-stroke rounded-lg px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold text-muted">CD Magias</span>
          <span className="text-xs opacity-50">?</span>
        </div>
        <span className="text-lg font-bold">{spellSaveDc}</span>
      </div>
    </Tooltip>
  )
}

export default SpellDCCard
