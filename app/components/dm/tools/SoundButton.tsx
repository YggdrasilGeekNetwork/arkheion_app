import { useState } from 'react'
import type { SoundDefinition } from '~/types/soundboard'
import VariantPicker from './soundboard/VariantPicker'

type SoundButtonProps = {
  sound: SoundDefinition
  isPlaying: boolean
  volume: number
  preferredVariantId: string | null
  activeVariantId?: string
  onToggle: () => void
  onVolumeChange: (volume: number) => void
  onVariantChange?: (variantId: string | null) => void
  editMode?: boolean
  onRemove?: () => void
}

export default function SoundButton({
  sound, isPlaying, volume, preferredVariantId, activeVariantId,
  onToggle, onVolumeChange, onVariantChange, editMode, onRemove,
}: SoundButtonProps) {
  const [showVariants, setShowVariants] = useState(false)

  return (
    <div className="flex flex-col relative">
      <button
        onClick={onToggle}
        className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-md
          border transition-colors relative
          ${isPlaying
            ? 'bg-green-600/15 border-green-500/40 text-green-300'
            : 'bg-surface/50 border-stroke text-muted hover:border-accent/20 hover:text-fg'
          }`}
      >
        {isPlaying && (
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        )}
        {editMode && onRemove && (
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
        <span className="text-base">{sound.icon}</span>
        <span className="text-[11px] font-medium truncate w-full text-center">{sound.name}</span>
        {sound.loop && (
          <span className="text-[9px] opacity-40">loop</span>
        )}
      </button>

      {/* Variant badge */}
      {sound.variants.length > 1 && onVariantChange && (
        <button
          onClick={e => { e.stopPropagation(); setShowVariants(!showVariants) }}
          className={`text-[9px] mt-0.5 mx-auto px-1 rounded transition-colors
            ${preferredVariantId === null
              ? 'text-muted/60 hover:text-accent'
              : 'text-accent/70 hover:text-accent'
            }`}
        >
          🎲 {sound.variants.length}
        </button>
      )}

      {/* Variant picker dropdown */}
      {showVariants && onVariantChange && (
        <VariantPicker
          variants={sound.variants}
          selectedId={preferredVariantId}
          activeVariantId={activeVariantId}
          onSelect={onVariantChange}
          onClose={() => setShowVariants(false)}
        />
      )}

      {/* Volume slider when playing */}
      {isPlaying && (
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={e => onVolumeChange(Number(e.target.value) / 100)}
          className="w-full h-1 mt-1 accent-green-400 cursor-pointer"
          onClick={e => e.stopPropagation()}
        />
      )}
    </div>
  )
}
