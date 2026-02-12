import type { NoteLink } from '~/types/notes'
import { useMesa } from '~/contexts/MesaContext'

const LINK_STYLES: Record<NoteLink['type'], { icon: string; color: string }> = {
  campaign: { icon: '🗺️', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  adventure: { icon: '📜', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  session: { icon: '📅', color: 'bg-green-500/15 text-green-300 border-green-500/30' },
  encounter: { icon: '⚔️', color: 'bg-red-500/15 text-red-300 border-red-500/30' },
}

type NoteLinkBadgesProps = {
  links: NoteLink[]
  noteId: string
  onAddLink: () => void
}

export default function NoteLinkBadges({ links, noteId, onAddLink }: NoteLinkBadgesProps) {
  const { dispatch } = useMesa()

  function handleRemove(link: NoteLink) {
    dispatch({
      type: 'REMOVE_NOTE_LINK',
      payload: { noteId, linkType: link.type, linkId: link.id },
    })
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {links.map(link => {
        const style = LINK_STYLES[link.type]
        return (
          <span
            key={`${link.type}-${link.id}`}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full
              text-[9px] border ${style.color} group`}
          >
            <span>{style.icon}</span>
            <span className="max-w-[100px] truncate">{link.label}</span>
            <button
              onClick={() => handleRemove(link)}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-0.5"
            >
              ✕
            </button>
          </span>
        )
      })}
      <button
        onClick={onAddLink}
        className="text-[9px] text-muted hover:text-accent px-1.5 py-0.5
          border border-dashed border-stroke rounded-full hover:border-accent/40 transition-colors"
      >
        + Vincular
      </button>
    </div>
  )
}
