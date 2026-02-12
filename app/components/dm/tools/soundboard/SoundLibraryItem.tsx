import type { SoundDefinition } from '~/types/soundboard'

type SoundLibraryItemProps = {
  sound: SoundDefinition
  isOnBoard: boolean
  onAdd: () => void
}

export default function SoundLibraryItem({ sound, isOnBoard, onAdd }: SoundLibraryItemProps) {
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-surface/50
      transition-colors group"
    >
      <span className="text-sm">{sound.icon}</span>
      <span className="flex-1 text-xs text-fg truncate">{sound.name}</span>
      {sound.variants.length > 1 && (
        <span className="text-[10px] text-muted bg-surface/80 px-1 rounded">
          {sound.variants.length}x
        </span>
      )}
      {sound.loop && (
        <span className="text-[9px] text-muted/50">loop</span>
      )}
      {isOnBoard ? (
        <span className="text-green-400 text-xs">✓</span>
      ) : (
        <button
          onClick={onAdd}
          className="text-accent hover:text-accent/80 text-xs font-bold
            opacity-0 group-hover:opacity-100 transition-opacity px-0.5"
        >
          +
        </button>
      )}
    </div>
  )
}
