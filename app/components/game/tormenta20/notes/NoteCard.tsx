import type { CharacterNote, CharacterNoteTag } from '~/types/character'
import { getNoteColor } from './noteConstants'

type NoteCardProps = {
  note: CharacterNote
  allTags: CharacterNoteTag[]
  sessionName?: string
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function NoteCard({ note, allTags, sessionName, onClick, onDelete }: NoteCardProps) {
  const color = getNoteColor(note.color)
  const noteTags = allTags.filter(t => note.tags.includes(t.id))
  const plain = stripHtml(note.content)
  const preview = plain.slice(0, 120) + (plain.length > 120 ? '…' : '')

  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg border p-3 cursor-pointer transition-shadow hover:shadow-md select-none ${color.bg} ${color.border}`}
    >
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors text-[10px] text-black/50 hover:text-black/80"
        title="Excluir nota"
      >
        ✕
      </button>

      {/* Pinned indicator */}
      {note.pinned && (
        <span className="absolute top-1.5 left-1.5 text-[10px]">📌</span>
      )}

      {/* Title */}
      {note.title && (
        <p className={`text-[13px] font-semibold leading-tight mb-1.5 pr-5 ${color.text} ${note.pinned ? 'pl-4' : ''}`}>
          {note.title}
        </p>
      )}

      {/* Content preview */}
      {preview && (
        <p className={`text-[11px] leading-relaxed whitespace-pre-wrap ${color.text} opacity-80 ${!note.title ? (note.pinned ? 'pl-4 pr-5' : 'pr-5') : ''}`}>
          {preview}
        </p>
      )}

      {/* Tags */}
      {noteTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {noteTags.map(tag => (
            <span
              key={tag.id}
              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-black/10"
              style={{ color: tag.color }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Session badge */}
      {sessionName && (
        <div className="mt-1.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/10 text-black/60">
            📅 {sessionName}
          </span>
        </div>
      )}
    </div>
  )
}
