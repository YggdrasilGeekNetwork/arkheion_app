import type { Character } from '~/types/character'
import ResistanceCard from '../ResistanceCard'

type OtherTabProps = {
  character: Character
  onResistancesChange: (newResistances: typeof character.resistances) => void
}

export default function OtherTab({
  character,
  onResistancesChange,
}: OtherTabProps) {
  return (
    <ResistanceCard
      resistances={character.resistances}
      onResistancesChange={onResistancesChange}
    />
  )
}
