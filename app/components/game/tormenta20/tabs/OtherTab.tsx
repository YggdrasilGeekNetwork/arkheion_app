import type { Character, CharacterNotesData } from '~/types/character'
import ResistanceCard from '../ResistanceCard'
import NotesPanel from '../notes/NotesPanel'

type OtherTabProps = {
  character: Character
  onResistancesChange: (newResistances: Character['resistances']) => void
  onNotesChange: (notes: CharacterNotesData) => void
}

export default function OtherTab({
  character,
  onResistancesChange,
  onNotesChange,
}: OtherTabProps) {
  const notesData: CharacterNotesData = character.notes ?? { items: [], customTags: [] }
  return (
    <div className="flex flex-col gap-3 h-full">
      <NotesPanel
        notesData={notesData}
        onSave={onNotesChange}
      />
    </div>
  )
}
