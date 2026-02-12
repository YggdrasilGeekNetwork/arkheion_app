type ResistanceChipProps = {
  value: number
}

export default function ResistanceChip({ value }: ResistanceChipProps) {
  const sign = value >= 0 ? '+' : ''

  return (
    <span className="text-xs font-bold">
      {sign}{value}
    </span>
  )
}
