import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Note, NoteFolder, NoteLink } from '~/types/notes'
import { initialState as mesaInitialState } from '~/reducers/mesaReducer'

type NotesState = {
  notes: Note[]
  noteFolders: NoteFolder[]
  activeNoteId: string | null
  activeFolderId: string | null
}

const initialState: NotesState = {
  notes: mesaInitialState.notes,
  noteFolders: mesaInitialState.noteFolders,
  activeNoteId: mesaInitialState.activeNoteId,
  activeFolderId: mesaInitialState.activeFolderId,
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    createNote(state, action: PayloadAction<{ note: Note }>) {
      state.notes.push(action.payload.note)
      state.activeNoteId = action.payload.note.id
    },
    updateNote(state, action: PayloadAction<{ noteId: string; updates: Partial<Note> }>) {
      const note = state.notes.find(n => n.id === action.payload.noteId)
      if (note) {
        Object.assign(note, action.payload.updates)
        note.updatedAt = new Date().toISOString()
      }
    },
    deleteNote(state, action: PayloadAction<{ noteId: string }>) {
      state.notes = state.notes.filter(n => n.id !== action.payload.noteId)
      if (state.activeNoteId === action.payload.noteId) state.activeNoteId = null
    },
    setActiveNote(state, action: PayloadAction<{ noteId: string | null }>) {
      state.activeNoteId = action.payload.noteId
    },
    toggleNotePin(state, action: PayloadAction<{ noteId: string }>) {
      const note = state.notes.find(n => n.id === action.payload.noteId)
      if (note) {
        note.pinned = !note.pinned
        note.updatedAt = new Date().toISOString()
      }
    },
    moveNoteToFolder(state, action: PayloadAction<{ noteId: string; folderId: string | null }>) {
      const note = state.notes.find(n => n.id === action.payload.noteId)
      if (note) {
        note.folderId = action.payload.folderId
        note.updatedAt = new Date().toISOString()
      }
    },
    addNoteLink(state, action: PayloadAction<{ noteId: string; link: NoteLink }>) {
      const note = state.notes.find(n => n.id === action.payload.noteId)
      if (note) {
        note.links.push(action.payload.link)
        note.updatedAt = new Date().toISOString()
      }
    },
    removeNoteLink(state, action: PayloadAction<{ noteId: string; linkType: string; linkId: string }>) {
      const note = state.notes.find(n => n.id === action.payload.noteId)
      if (note) {
        note.links = note.links.filter(
          l => !(l.type === action.payload.linkType && l.id === action.payload.linkId)
        )
        note.updatedAt = new Date().toISOString()
      }
    },
    createNoteFolder(state, action: PayloadAction<{ folder: NoteFolder }>) {
      state.noteFolders.push(action.payload.folder)
    },
    renameNoteFolder(state, action: PayloadAction<{ folderId: string; name: string }>) {
      const folder = state.noteFolders.find(f => f.id === action.payload.folderId)
      if (folder) folder.name = action.payload.name
    },
    deleteNoteFolder(state, action: PayloadAction<{ folderId: string }>) {
      const idsToDelete = new Set<string>()
      function collectChildren(parentId: string) {
        idsToDelete.add(parentId)
        for (const f of state.noteFolders) {
          if (f.parentId === parentId) collectChildren(f.id)
        }
      }
      collectChildren(action.payload.folderId)

      state.noteFolders = state.noteFolders.filter(f => !idsToDelete.has(f.id))
      for (const note of state.notes) {
        if (note.folderId && idsToDelete.has(note.folderId)) note.folderId = null
      }
      if (state.activeFolderId && idsToDelete.has(state.activeFolderId)) state.activeFolderId = null
    },
    setActiveFolder(state, action: PayloadAction<{ folderId: string | null }>) {
      state.activeFolderId = action.payload.folderId
    },
  },
})

export const notesActions = notesSlice.actions
export const notesReducer = notesSlice.reducer
export type { NotesState }
