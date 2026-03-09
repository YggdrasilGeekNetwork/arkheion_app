import Card from '~/components/ui/Card'

type SpellDCCardProps = {
  spellSaveDc: number
  tooltip?: string
  notes?: string[]
}

const SpellDCCard = ({ spellSaveDc, tooltip, notes = [] }: SpellDCCardProps) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-0.5 md:mb-1">
        <div className="text-sm md:text-base font-semibold">CD Magias</div>
        <div className="text-lg md:text-xl font-bold">{spellSaveDc}</div>
      </div>
      <div className="text-[10px] md:text-xs text-muted leading-tight">
        {tooltip ?? '10 + modificador do atributo de conjuração'}
      </div>
      {notes.length > 0 && (
        <div className="mt-1 text-[10px] md:text-xs text-muted leading-tight border-t border-stroke pt-1">
          {notes.map((note, i) => (
            <div key={i}>{note}</div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default SpellDCCard
