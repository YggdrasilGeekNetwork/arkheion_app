export type NoteLink = {
  type: 'campaign' | 'adventure' | 'session' | 'encounter'
  id: string
  label: string
}

export type Note = {
  id: string
  title: string
  content: string // HTML do Tiptap
  folderId: string | null
  links: NoteLink[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export type NoteFolder = {
  id: string
  name: string
  parentId: string | null
  color?: string
  createdAt: string
}
