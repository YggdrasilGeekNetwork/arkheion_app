import { useState } from 'react'
import {
  DndContext, DragEndEvent, DragStartEvent, DragOverlay,
  closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { SoundboardSlot, CustomSound, SoundDefinition } from '~/types/soundboard'
import type { AudioEngine } from './useAudioEngine'
import { resolveSound, resolveVariant } from './soundboardHelpers'
import SortableSoundSlot from './SortableSoundSlot'
import SoundButton from '../SoundButton'

type PersonalBoardProps = {
  slots: SoundboardSlot[]
  customSounds: CustomSound[]
  audioEngine: AudioEngine
  onReorder: (slots: SoundboardSlot[]) => void
  onRemoveSlot: (slotId: string) => void
  onUpdateSlot: (slotId: string, updates: Partial<SoundboardSlot>) => void
}

export default function PersonalBoard({
  slots, customSounds, audioEngine,
  onReorder, onRemoveSlot, onUpdateSlot,
}: PersonalBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  )

  const sortedSlots = [...slots].sort((a, b) => a.order - b.order)

  // Split into ambient (loop) and effects (one-shot)
  const resolvedSlots = sortedSlots.map(slot => ({
    slot,
    sound: resolveSound(slot, customSounds),
  })).filter((s): s is { slot: SoundboardSlot; sound: SoundDefinition } => s.sound !== null)

  const ambientSlots = resolvedSlots.filter(s => s.sound.loop)
  const effectSlots = resolvedSlots.filter(s => !s.sound.loop)

  function handleToggle(slot: SoundboardSlot) {
    const sound = resolveSound(slot, customSounds)
    if (!sound) return

    if (audioEngine.isPlaying(slot.soundId)) {
      audioEngine.stop(slot.soundId)
    } else {
      const variant = resolveVariant(sound, slot.preferredVariantId)
      audioEngine.play(slot.soundId, variant.url, sound.loop, variant.id)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedSlots.findIndex(s => s.id === active.id)
    const newIndex = sortedSlots.findIndex(s => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(sortedSlots, oldIndex, newIndex)
      .map((s, i) => ({ ...s, order: i }))
    onReorder(reordered)
  }

  const activeSlot = activeId ? sortedSlots.find(s => s.id === activeId) : null
  const activeSound = activeSlot ? resolveSound(activeSlot, customSounds) : null

  function renderGrid(items: { slot: SoundboardSlot; sound: SoundDefinition }[]) {
    return (
      <div className="grid grid-cols-6 gap-1">
        {items.map(({ slot, sound }) => (
          <SortableSoundSlot
            key={slot.id}
            slot={slot}
            sound={sound}
            isPlaying={audioEngine.isPlaying(slot.soundId)}
            volume={audioEngine.getVolume(slot.soundId)}
            activeVariantId={audioEngine.getActiveVariantId(slot.soundId)}
            onToggle={() => handleToggle(slot)}
            onVolumeChange={vol => audioEngine.setVolume(slot.soundId, vol)}
            onRemove={() => onRemoveSlot(slot.id)}
            onVariantChange={variantId => onUpdateSlot(slot.id, { preferredVariantId: variantId })}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSlots.map(s => s.id)}
          strategy={rectSortingStrategy}
        >
          {ambientSlots.length > 0 && (
            <div className="mb-2">
              <div className="text-[11px] text-muted/60 uppercase tracking-wider font-medium mb-1 px-0.5">
                Ambiência
              </div>
              {renderGrid(ambientSlots)}
            </div>
          )}

          {effectSlots.length > 0 && (
            <div>
              {ambientSlots.length > 0 && (
                <div className="border-t border-stroke/40 my-2" />
              )}
              <div className="text-[11px] text-muted/60 uppercase tracking-wider font-medium mb-1 px-0.5">
                Efeitos Sonoros
              </div>
              {renderGrid(effectSlots)}
            </div>
          )}
        </SortableContext>

        <DragOverlay>
          {activeSound && activeSlot && (
            <div className="opacity-80 rotate-2 scale-105">
              <SoundButton
                sound={activeSound}
                isPlaying={false}
                volume={0.7}
                preferredVariantId={activeSlot.preferredVariantId}
                onToggle={() => {}}
                onVolumeChange={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {sortedSlots.length === 0 && (
        <div className="text-xs text-muted/50 text-center py-4">
          Nenhum som no board. Adicione pela biblioteca.
        </div>
      )}
    </div>
  )
}
