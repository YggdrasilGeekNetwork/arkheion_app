import type { Character } from '~/types/character'
import ResistanceCard from '../ResistanceCard'
import PlayerNotesCard from '../PlayerNotesCard'

type OtherTabProps = {
  character: Character
  onResistancesChange: (newResistances: typeof character.resistances) => void
  onNotesChange: (notes: string) => void
}

export default function OtherTab({
  character,
  onResistancesChange,
  onNotesChange,
}: OtherTabProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <ResistanceCard
        resistances={character.resistances}
        onResistancesChange={onResistancesChange}
      />
      <PlayerNotesCard
        notes={character.notes ?? ''}
        onChange={onNotesChange}
      />
    </div>
  )
}
