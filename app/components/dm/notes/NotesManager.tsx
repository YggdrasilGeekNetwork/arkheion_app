import { useState } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import NotesSidebar from './NotesSidebar'
import NoteEditor from './NoteEditor'
import NoteLinkModal from './NoteLinkModal'

export default function NotesManager() {
  const { state, dispatch } = useMesa()
  const [showLinkModal, setShowLinkModal] = useState(false)

  const activeNote = state.notes.find(n => n.id === state.activeNoteId) ?? null

  function handleSelectNote(noteId: string) {
    dispatch({ type: 'SET_ACTIVE_NOTE', payload: { noteId } })
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar ~35% */}
      <div className="w-[35%] min-w-[140px] border-r border-stroke flex-shrink-0">
        <NotesSidebar
          notes={state.notes}
          folders={state.noteFolders}
          activeNoteId={state.activeNoteId}
          onSelectNote={handleSelectNote}
        />
      </div>

      {/* Editor ~65% */}
      <div className="flex-1 min-w-0">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onOpenLinkModal={() => setShowLinkModal(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-2xl mb-2 opacity-30">📝</div>
            <div className="text-xs text-muted/60 mb-2">Selecione ou crie uma nota</div>
            <button
              onClick={() => {
                const now = new Date().toISOString()
                dispatch({
                  type: 'CREATE_NOTE',
                  payload: {
                    note: {
                      id: `note-${Date.now()}`,
                      title: '',
                      content: '',
                      folderId: null,
                      links: [],
                      pinned: false,
                      createdAt: now,
                      updatedAt: now,
                    },
                  },
                })
              }}
              className="text-[10px] text-accent hover:text-accent/80 px-3 py-1
                border border-accent/30 rounded hover:bg-accent/10 transition-colors"
            >
              + Nova nota
            </button>
          </div>
        )}
      </div>

      {/* Link modal */}
      {showLinkModal && activeNote && (
        <NoteLinkModal
          noteId={activeNote.id}
          existingLinks={activeNote.links}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </div>
  )
}
