import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SoundDefinition, SoundboardSlot } from '~/types/soundboard'
import SoundButton from '../SoundButton'

type SortableSoundSlotProps = {
  slot: SoundboardSlot
  sound: SoundDefinition
  isPlaying: boolean
  volume: number
  activeVariantId?: string
  onToggle: () => void
  onVolumeChange: (vol: number) => void
  onRemove: () => void
  onVariantChange: (variantId: string | null) => void
}

export default function SortableSoundSlot({
  slot, sound, isPlaying, volume, activeVariantId,
  onToggle, onVolumeChange, onRemove, onVariantChange,
}: SortableSoundSlotProps) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: slot.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/slot">
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute -top-0.5 left-1/2 -translate-x-1/2 z-10
          text-[8px] text-muted/40 hover:text-muted cursor-grab touch-none
          opacity-0 group-hover/slot:opacity-100 transition-opacity"
      >
        ⠿
      </div>
      <SoundButton
        sound={sound}
        isPlaying={isPlaying}
        volume={volume}
        preferredVariantId={slot.preferredVariantId}
        activeVariantId={activeVariantId}
        onToggle={onToggle}
        onVolumeChange={onVolumeChange}
        onVariantChange={onVariantChange}
        editMode
        onRemove={onRemove}
      />
    </div>
  )
}
