import { useState } from 'react'
import { useAppSelector } from '~/store/hooks'
import type { CharacterNote, CharacterNotesData } from '~/types/character'
import { PREDEFINED_TAGS } from './noteConstants'
import NoteCard from './NoteCard'
import NoteEditor from './NoteEditor'

type NotesPanelProps = {
  notesData: CharacterNotesData
  onSave: (data: CharacterNotesData) => void
}

export default function NotesPanel({ notesData, onSave }: NotesPanelProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const activeSessionId = useAppSelector(s => s.encounters.activeSessionId)
  const activeSession = useAppSelector(s => {
    const enc = s.encounters
    if (!enc.activeSessionId || !enc.activeCampaignId || !enc.activeAdventureId) return null
    const campaign = enc.campaigns.find(c => c.id === enc.activeCampaignId)
    const adventure = campaign?.adventures?.find((a: { id: string }) => a.id === enc.activeAdventureId)
    return adventure?.sessions?.find((se: { id: string }) => se.id === enc.activeSessionId) ?? null
  })

  const items = notesData.items ?? []
  const customTags = notesData.customTags ?? []
  const allTags = [...PREDEFINED_TAGS, ...customTags]

  function getSessionName(sessionId: string | null) {
    if (!sessionId) return undefined
    if (activeSession && activeSession.id === sessionId) return activeSession.name
    return undefined
  }

  function handleNewNote() {
    const newNote: CharacterNote = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      tags: [],
      sessionId: null,
      color: 'yellow',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated: CharacterNotesData = { items: [...items, newNote], customTags }
    onSave(updated)
    setEditingNoteId(newNote.id)
  }

  function handleSaveNote(updated: CharacterNote) {
    const newItems = items.map(n => n.id === updated.id ? updated : n)
    onSave({ items: newItems, customTags })
  }

  function handleDeleteNote(noteId: string) {
    const newItems = items.filter(n => n.id !== noteId)
    onSave({ items: newItems, customTags })
    if (editingNoteId === noteId) setEditingNoteId(null)
  }

  function handleSaveNoteWithCustomTag(updated: CharacterNote) {
    // When NoteEditor adds a custom tag via mutation, sync customTags from allTags
    const newCustomTags = allTags.filter(t => t.isCustom)
    const newItems = items.map(n => n.id === updated.id ? updated : n)
    onSave({ items: newItems, customTags: newCustomTags })
  }

  const editingNote = editingNoteId ? items.find(n => n.id === editingNoteId) : null

  if (editingNote) {
    return (
      <NoteEditor
        note={editingNote}
        customTags={customTags}
        activeSessionId={activeSessionId}
        activeSessionName={activeSession?.name ?? null}
        onSave={handleSaveNoteWithCustomTag}
        onDelete={() => handleDeleteNote(editingNote.id)}
        onBack={() => setEditingNoteId(null)}
      />
    )
  }

  // Panel view
  const pinned = items.filter(n => n.pinned)
  const unpinned = items.filter(n => !n.pinned)
  const sorted = [...pinned, ...unpinned]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">Anotações</span>
        <button
          onClick={handleNewNote}
          className="text-[11px] px-2 py-1 rounded bg-card-muted border border-stroke hover:border-accent transition-colors"
        >
          + Nova nota
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="text-2xl mb-2">📝</div>
            <p className="text-xs text-muted">Nenhuma anotação ainda.</p>
            <p className="text-xs text-muted">Clique em "+ Nova nota" para começar.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {sorted.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                allTags={allTags}
                sessionName={getSessionName(note.sessionId)}
                onClick={() => setEditingNoteId(note.id)}
                onDelete={e => { e.stopPropagation(); handleDeleteNote(note.id) }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
