import type { Note } from '~/types/notes'

type NoteListItemProps = {
  note: Note
  isActive: boolean
  onSelect: () => void
}

export default function NoteListItem({ note, isActive, onSelect }: NoteListItemProps) {
  const date = new Date(note.updatedAt)
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-2 py-1.5 rounded transition-colors group
        ${isActive
          ? 'bg-accent/15 border border-accent/30'
          : 'hover:bg-surface/50 border border-transparent'
        }`}
    >
      <div className="flex items-center gap-1">
        {note.pinned && <span className="text-[9px]">📌</span>}
        <span className={`text-[11px] font-medium truncate flex-1
          ${isActive ? 'text-accent' : 'text-fg'}`}>
          {note.title || 'Sem título'}
        </span>
        <span className="text-[9px] text-muted flex-shrink-0">{dateStr}</span>
      </div>
      {note.links.length > 0 && (
        <div className="flex items-center gap-1 mt-0.5">
          {note.links.slice(0, 3).map(l => (
            <span key={`${l.type}-${l.id}`} className="text-[8px] text-muted/60">
              {l.type === 'campaign' ? '🗺️' : l.type === 'adventure' ? '📜' : l.type === 'session' ? '📅' : '⚔️'}
            </span>
          ))}
          {note.links.length > 3 && (
            <span className="text-[8px] text-muted/40">+{note.links.length - 3}</span>
          )}
        </div>
      )}
    </button>
  )
}
