import type { Character } from './character'

// Core Mesa (Table) type
export type Mesa = {
  id: string
  name: string
  description?: string
  imageUrl?: string
  dmId: string
  characterIds: string[]
  createdAt: string
  updatedAt: string
}

// Mesa with populated character data for the dashboard
export type MesaWithCharacters = Omit<Mesa, 'characterIds'> & {
  characters: Character[]
}

// Summary for mesa list view
export type MesaSummary = {
  id: string
  name: string
  imageUrl?: string
  characterCount: number
  updatedAt: string
}

// Configuration for which fields are visible in Party Snapshot
export type PartySnapshotField = {
  id: string
  label: string
  fieldPath: string
  type: 'text' | 'number' | 'resource' | 'attribute' | 'resistance'
  visible: boolean
  order: number
}

// Pre-defined field templates
export const DEFAULT_PARTY_SNAPSHOT_FIELDS: Omit<PartySnapshotField, 'id'>[] = [
  { label: 'Nome', fieldPath: 'name', type: 'text', visible: true, order: 0 },
  { label: 'CA', fieldPath: 'defenses.CA', type: 'number', visible: true, order: 1 },
  { label: 'Nível', fieldPath: 'level', type: 'number', visible: true, order: 2 },
  { label: 'PV', fieldPath: 'health', type: 'resource', visible: true, order: 3 },
  { label: 'PM', fieldPath: 'mana', type: 'resource', visible: true, order: 4 },
  { label: 'Fort', fieldPath: 'resistances.Fortitude', type: 'resistance', visible: true, order: 5 },
  { label: 'Refl', fieldPath: 'resistances.Reflexos', type: 'resistance', visible: true, order: 6 },
  { label: 'Vont', fieldPath: 'resistances.Vontade', type: 'resistance', visible: true, order: 7 },
  { label: 'FOR', fieldPath: 'attributes.FOR', type: 'attribute', visible: false, order: 8 },
  { label: 'DES', fieldPath: 'attributes.DES', type: 'attribute', visible: false, order: 9 },
  { label: 'CON', fieldPath: 'attributes.CON', type: 'attribute', visible: false, order: 10 },
  { label: 'INT', fieldPath: 'attributes.INT', type: 'attribute', visible: false, order: 11 },
  { label: 'SAB', fieldPath: 'attributes.SAB', type: 'attribute', visible: false, order: 12 },
  { label: 'CAR', fieldPath: 'attributes.CAR', type: 'attribute', visible: false, order: 13 },
]

// Type for extracted character snapshot data
export type CharacterSnapshotData = {
  id: string
  name: string
  imageUrl?: string
  level: number
  ca: number
  health: { current: number; max: number }
  mana: { current: number; max: number }
  resistances: {
    fortitude: number
    reflexos: number
    vontade: number
  }
  attributes: {
    FOR: { value: number; modifier: number }
    DES: { value: number; modifier: number }
    CON: { value: number; modifier: number }
    INT: { value: number; modifier: number }
    SAB: { value: number; modifier: number }
    CAR: { value: number; modifier: number }
  }
}
