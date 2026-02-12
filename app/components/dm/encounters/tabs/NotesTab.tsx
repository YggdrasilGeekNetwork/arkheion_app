import type { Note } from '~/types/notes'
import { useMesa } from '~/contexts/MesaContext'

type NotesTabProps = {
  encounterId: string
  encounterName: string
}

export default function NotesTab({ encounterId, encounterName }: NotesTabProps) {
  const { state, dispatch } = useMesa()

  const linkedNotes = state.notes.filter(n =>
    n.links.some(l => l.type === 'encounter' && l.id === encounterId)
  )

  function handleCreateNote() {
    const now = new Date().toISOString()
    const note: Note = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      folderId: null,
      links: [{ type: 'encounter', id: encounterId, label: encounterName }],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }
    dispatch({ type: 'CREATE_NOTE', payload: { note } })
  }

  function handleOpenNote(noteId: string) {
    dispatch({ type: 'SET_ACTIVE_NOTE', payload: { noteId } })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden px-3 py-2">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
          Notas deste encontro ({linkedNotes.length})
        </span>
        <button
          onClick={handleCreateNote}
          className="text-[10px] text-accent hover:text-accent/80 px-2 py-0.5
            border border-accent/30 rounded hover:bg-accent/10 transition-colors"
        >
          + Nova nota
        </button>
      </div>

      {linkedNotes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-xl opacity-30">📝</div>
            <div className="text-[10px] text-muted/60">Nenhuma nota vinculada</div>
            <button
              onClick={handleCreateNote}
              className="text-[10px] text-accent hover:text-accent/80"
            >
              Criar nota para este encontro
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {linkedNotes.map(note => {
            const date = new Date(note.updatedAt)
            const dateStr = date.toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', year: '2-digit',
            })

            return (
              <button
                key={note.id}
                onClick={() => handleOpenNote(note.id)}
                className="w-full text-left px-2.5 py-2 rounded-md border border-stroke
                  hover:border-accent/30 hover:bg-surface/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-fg truncate">
                    {note.pinned && '📌 '}{note.title || 'Sem título'}
                  </span>
                  <span className="text-[9px] text-muted flex-shrink-0 ml-2">{dateStr}</span>
                </div>
                {note.content && (
                  <div
                    className="text-[10px] text-muted/60 line-clamp-2 mt-0.5 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: note.content.replace(/<[^>]*>/g, ' ').slice(0, 120),
                    }}
                  />
                )}
                <div className="text-[9px] text-accent/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir no painel de notas
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
