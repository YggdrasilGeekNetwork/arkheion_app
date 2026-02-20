import { useState } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import { getActiveEncounter } from '~/reducers/mesaReducer'

export default function CombatSidebarNotes() {
  const { state } = useMesa()
  const encounter = getActiveEncounter(state)
  const [expanded, setExpanded] = useState(false)

  // Find notes linked to the active encounter
  const encounterNotes = state.notes.filter(n =>
    n.links?.some(l => l.type === 'encounter' && l.id === encounter?.id)
  )

  return (
    <div className="border-b border-stroke flex-shrink-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted hover:text-fg transition-colors"
      >
        <span>📝 Notas {encounterNotes.length > 0 ? `(${encounterNotes.length})` : ''}</span>
        <span className="text-[10px]">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-2 max-h-[150px] overflow-y-auto">
          {encounterNotes.length === 0 ? (
            <p className="text-[11px] text-muted/50">
              {encounter?.description || 'Sem notas vinculadas a este encontro.'}
            </p>
          ) : (
            <div className="space-y-1">
              {encounterNotes.map(note => (
                <div key={note.id} className="text-[11px] text-fg">
                  <div className="font-medium text-accent mb-0.5">{note.title}</div>
                  <div
                    className="text-muted/70 line-clamp-3 prose-compact"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>
              ))}
            </div>
          )}

          {encounter?.description && encounterNotes.length > 0 && (
            <div className="mt-1 pt-1 border-t border-stroke/50">
              <p className="text-[11px] text-muted/60">{encounter.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
