import type { CharacterNoteTag } from '~/types/character'

export const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200/90', border: 'border-yellow-300', text: 'text-yellow-900' },
  { id: 'green',  bg: 'bg-green-200/90',  border: 'border-green-300',  text: 'text-green-900'  },
  { id: 'blue',   bg: 'bg-blue-200/90',   border: 'border-blue-300',   text: 'text-blue-900'   },
  { id: 'pink',   bg: 'bg-pink-200/90',   border: 'border-pink-300',   text: 'text-pink-900'   },
  { id: 'purple', bg: 'bg-purple-200/90', border: 'border-purple-300', text: 'text-purple-900' },
  { id: 'orange', bg: 'bg-orange-200/90', border: 'border-orange-300', text: 'text-orange-900' },
] as const

export type NoteColorId = typeof NOTE_COLORS[number]['id']

export const DEFAULT_NOTE_COLOR: NoteColorId = 'yellow'

export const PREDEFINED_TAGS: CharacterNoteTag[] = [
  { id: 'personagem', label: 'Personagem', color: '#a78bfa', isCustom: false },
  { id: 'local',      label: 'Local',      color: '#34d399', isCustom: false },
  { id: 'item',       label: 'Item',       color: '#fbbf24', isCustom: false },
  { id: 'missao',     label: 'Missão',     color: '#f87171', isCustom: false },
  { id: 'lore',       label: 'Lore',       color: '#60a5fa', isCustom: false },
  { id: 'combate',    label: 'Combate',    color: '#fb923c', isCustom: false },
  { id: 'sessao',     label: 'Sessão',     color: '#e879f9', isCustom: false },
]

export function getNoteColor(colorId: string) {
  return NOTE_COLORS.find(c => c.id === colorId) ?? NOTE_COLORS[0]
}
