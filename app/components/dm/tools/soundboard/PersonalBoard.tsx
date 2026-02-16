import { useState } from 'react'
import {
  DndContext, DragEndEvent, DragStartEvent, DragOverlay,
  closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { SoundboardSlot, CustomSound, SoundDefinition, PlaylistSlot, PlaylistDefinition } from '~/types/soundboard'
import { DEFAULT_PLAYLISTS } from '~/data/soundEffects'
import type { AudioEngine } from './useAudioEngine'
import { resolveSound, resolveVariant } from './soundboardHelpers'
import SortableSoundSlot from './SortableSoundSlot'
import SoundButton from '../SoundButton'
import PlaylistButton from './PlaylistButton'

type PersonalBoardProps = {
  slots: SoundboardSlot[]
  customSounds: CustomSound[]
  editMode: boolean
  audioEngine: AudioEngine
  onReorder: (slots: SoundboardSlot[]) => void
  onRemoveSlot: (slotId: string) => void
  onUpdateSlot: (slotId: string, updates: Partial<SoundboardSlot>) => void
  playlistSlots: PlaylistSlot[]
  customPlaylists: PlaylistDefinition[]
  activePlaylistId: string | null
  onPlaylistToggle: (playlistId: string) => void
  onRemovePlaylistSlot: (slotId: string) => void
}

function resolvePlaylist(
  slot: PlaylistSlot,
  customPlaylists: PlaylistDefinition[],
): PlaylistDefinition | null {
  return DEFAULT_PLAYLISTS.find(p => p.id === slot.playlistId)
    ?? customPlaylists.find(p => p.id === slot.playlistId)
    ?? null
}

export default function PersonalBoard({
  slots, customSounds, editMode, audioEngine,
  onReorder, onRemoveSlot, onUpdateSlot,
  playlistSlots, customPlaylists, activePlaylistId,
  onPlaylistToggle, onRemovePlaylistSlot,
}: PersonalBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  )

  const sortedSlots = [...slots].sort((a, b) => a.order - b.order)

  const resolvedSlots = sortedSlots.map(slot => ({
    slot,
    sound: resolveSound(slot, customSounds),
  })).filter((s): s is { slot: SoundboardSlot; sound: SoundDefinition } => s.sound !== null)

  const ambientSlots = resolvedSlots.filter(s => s.sound.loop)
  const effectSlots = resolvedSlots.filter(s => !s.sound.loop)

  const sortedPlaylistSlots = [...playlistSlots].sort((a, b) => a.order - b.order)

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

  function renderGrid(items: { slot: SoundboardSlot; sound: SoundDefinition }[], cols: string) {
    return (
      <div className={`grid ${cols} gap-1`}>
        {items.map(({ slot, sound }) => (
          <SortableSoundSlot
            key={slot.id}
            slot={slot}
            sound={sound}
            editMode={editMode}
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

  const gridCols = editMode ? 'grid-cols-4' : 'grid-cols-6'

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
          {/* Horizontal layout: Ambiência | Efeitos side by side */}
          <div className="flex gap-3 min-h-0">
            {ambientSlots.length > 0 && (
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-muted/60 uppercase tracking-wider font-medium mb-1 px-0.5">
                  Ambiência
                </div>
                {renderGrid(ambientSlots, gridCols)}
              </div>
            )}

            {ambientSlots.length > 0 && effectSlots.length > 0 && (
              <div className="border-l border-stroke/40 self-stretch" />
            )}

            {effectSlots.length > 0 && (
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-muted/60 uppercase tracking-wider font-medium mb-1 px-0.5">
                  Efeitos Sonoros
                </div>
                {renderGrid(effectSlots, gridCols)}
              </div>
            )}
          </div>
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

      {/* Playlists section */}
      {sortedPlaylistSlots.length > 0 && (
        <>
          <div className="border-t border-stroke/40 my-2" />
          <div className="text-[11px] text-muted/60 uppercase tracking-wider font-medium mb-1 px-0.5">
            Playlists
          </div>
          <div className={`grid ${gridCols} gap-1`}>
            {sortedPlaylistSlots.map(slot => {
              const playlist = resolvePlaylist(slot, customPlaylists)
              if (!playlist) return null
              return (
                <PlaylistButton
                  key={slot.id}
                  playlist={playlist}
                  isActive={activePlaylistId === slot.playlistId}
                  onToggle={() => onPlaylistToggle(slot.playlistId)}
                  onRemove={editMode ? () => onRemovePlaylistSlot(slot.id) : undefined}
                />
              )
            })}
          </div>
        </>
      )}

      {sortedSlots.length === 0 && sortedPlaylistSlots.length === 0 && (
        <div className="text-xs text-muted/50 text-center py-4">
          Nenhum som no board. Use "Editar" para adicionar.
        </div>
      )}
    </div>
  )
}
