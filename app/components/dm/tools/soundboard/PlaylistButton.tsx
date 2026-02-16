import type { PlaylistDefinition } from '~/types/soundboard'

type PlaylistButtonProps = {
  playlist: PlaylistDefinition
  isActive: boolean
  onToggle: () => void
  onRemove?: () => void
}

export default function PlaylistButton({
  playlist, isActive, onToggle, onRemove,
}: PlaylistButtonProps) {
  return (
    <div className="relative group/slot">
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500/80
            text-[8px] text-white flex items-center justify-center z-10
            hover:bg-red-400 transition-colors
            opacity-0 group-hover/slot:opacity-100"
        >
          ✕
        </button>
      )}
      <button
        onClick={onToggle}
        className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-md
          border transition-colors w-full
          ${isActive
            ? 'bg-green-600/15 border-green-500/40 text-green-300'
            : 'bg-surface/50 border-stroke text-muted hover:border-accent/20 hover:text-fg'
          }`}
      >
        {isActive && (
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        )}
        <span className="text-base">{playlist.icon}</span>
        <span className="text-[11px] font-medium truncate w-full text-center">{playlist.name}</span>
        <span className="text-[9px] opacity-40">
          {playlist.type === 'spotify' ? '♫' : '▶'}
        </span>
      </button>
    </div>
  )
}
