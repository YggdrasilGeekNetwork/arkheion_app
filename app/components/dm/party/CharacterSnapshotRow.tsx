import { useState } from 'react'
import type { Character } from '~/types/character'
import type { PartySnapshotField, CharacterSnapshotData } from '~/types/mesa'
import ResourceBar from './ResourceBar'
import AttributeChip from './AttributeChip'
import ResistanceChip from './ResistanceChip'
import CharacterQuickViewModal from '../modals/CharacterQuickViewModal'

type CharacterSnapshotRowProps = {
  character: Character
  fields: PartySnapshotField[]
  snapshotData: CharacterSnapshotData
}

export default function CharacterSnapshotRow({
  character,
  fields,
  snapshotData,
}: CharacterSnapshotRowProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  const renderFieldValue = (field: PartySnapshotField) => {
    switch (field.type) {
      case 'text':
        if (field.fieldPath === 'name') {
          return (
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="text-left truncate hover:text-accent transition-colors font-medium"
            >
              {snapshotData.name}
            </button>
          )
        }
        return <span className="truncate">{snapshotData.name}</span>

      case 'number':
        if (field.fieldPath === 'defenses.CA') {
          return <span className="font-bold">{snapshotData.ca}</span>
        }
        if (field.fieldPath === 'level') {
          return <span className="font-bold">{snapshotData.level}</span>
        }
        return null

      case 'resource':
        if (field.fieldPath === 'health') {
          return (
            <ResourceBar
              current={snapshotData.health.current}
              max={snapshotData.health.max}
              type="health"
            />
          )
        }
        if (field.fieldPath === 'mana') {
          return (
            <ResourceBar
              current={snapshotData.mana.current}
              max={snapshotData.mana.max}
              type="mana"
            />
          )
        }
        return null

      case 'attribute': {
        const attrKey = field.fieldPath.split('.')[1] as keyof typeof snapshotData.attributes
        const attr = snapshotData.attributes[attrKey]
        if (!attr) return null
        return <AttributeChip modifier={attr.modifier} />
      }

      case 'resistance': {
        const resKey = field.fieldPath.split('.')[1].toLowerCase() as keyof typeof snapshotData.resistances
        const value = snapshotData.resistances[resKey]
        if (value === undefined) return null
        return <ResistanceChip value={value} />
      }

      default:
        return null
    }
  }

  // Calculate grid template based on field types
  // Name gets 2fr, resources get 1.5fr, others get 1fr
  const getGridTemplate = () => {
    return fields
      .map(f => {
        if (f.fieldPath === 'name') return '2fr'
        if (f.type === 'resource') return '1.5fr'
        return '1fr'
      })
      .join(' ')
  }

  return (
    <>
      <div
        className="grid gap-2 p-2 bg-card border border-stroke rounded-lg hover:border-accent transition-colors text-sm items-center"
        style={{ gridTemplateColumns: getGridTemplate() }}
      >
        {fields.map(field => (
          <div key={field.id} className="flex items-center justify-center">
            {renderFieldValue(field)}
          </div>
        ))}
      </div>

      <CharacterQuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        character={character}
        snapshotData={snapshotData}
      />
    </>
  )
}
