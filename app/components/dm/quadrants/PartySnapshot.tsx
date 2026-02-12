import { useState } from 'react'
import type { Character } from '~/types/character'
import type { PartySnapshotField } from '~/types/mesa'
import { DEFAULT_PARTY_SNAPSHOT_FIELDS } from '~/types/mesa'
import CharacterSnapshotRow from '../party/CharacterSnapshotRow'
import ConfigureFieldsModal from '../modals/ConfigureFieldsModal'
import { extractSnapshotData } from '../utils/snapshotHelpers'

type PartySnapshotProps = {
  characters: Character[]
}

export default function PartySnapshot({ characters }: PartySnapshotProps) {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [fields, setFields] = useState<PartySnapshotField[]>(
    DEFAULT_PARTY_SNAPSHOT_FIELDS.map((f, i) => ({ ...f, id: `field-${i}` }))
  )

  const visibleFields = fields.filter(f => f.visible).sort((a, b) => a.order - b.order)

  const toggleField = (fieldId: string) => {
    setFields(prev =>
      prev.map(f => (f.id === fieldId ? { ...f, visible: !f.visible } : f))
    )
  }

  // Calculate grid template based on field types
  const getHeaderGridTemplate = () => {
    return visibleFields
      .map(f => {
        if (f.fieldPath === 'name') return '2fr'
        if (f.type === 'resource') return '1.5fr'
        return '1fr'
      })
      .join(' ')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="text-sm font-semibold">
          {characters.length} Personage{characters.length === 1 ? 'm' : 'ns'}
        </div>
        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="text-xs px-2 py-0.5 bg-btn-bg border border-stroke rounded hover:bg-card-muted transition-colors"
        >
          Configurar
        </button>
      </div>

      {/* Column Headers */}
      {visibleFields.length > 0 && (
        <div
          className="grid gap-2 mb-1 text-[10px] text-muted font-semibold flex-shrink-0 px-2"
          style={{ gridTemplateColumns: getHeaderGridTemplate() }}
        >
          {visibleFields.map(field => (
            <div key={field.id} className="text-center truncate">
              {field.label}
            </div>
          ))}
        </div>
      )}

      {/* Character Rows */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {characters.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted text-sm">
            Nenhum personagem na mesa
          </div>
        ) : (
          characters.map(character => (
            <CharacterSnapshotRow
              key={character.id}
              character={character}
              fields={visibleFields}
              snapshotData={extractSnapshotData(character)}
            />
          ))
        )}
      </div>

      {/* Configure Fields Modal */}
      <ConfigureFieldsModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        fields={fields}
        onToggleField={toggleField}
      />
    </div>
  )
}
