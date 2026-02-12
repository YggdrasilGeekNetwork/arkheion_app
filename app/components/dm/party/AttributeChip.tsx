type AttributeChipProps = {
  modifier: number
}

export default function AttributeChip({ modifier }: AttributeChipProps) {
  const sign = modifier >= 0 ? '+' : ''

  return (
    <span className="text-xs font-bold">
      {sign}{modifier}
    </span>
  )
}
