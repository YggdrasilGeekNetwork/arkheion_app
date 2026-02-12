import { useMemo } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import type { AudioEngine } from './soundboard/useAudioEngine'
import type { SoundboardSlot, CustomSound } from '~/types/soundboard'
import PersonalBoard from './soundboard/PersonalBoard'
import SoundLibrary from './soundboard/SoundLibrary'
import MusicPlayer from './MusicPlayer'
import type { RecentMedia } from './MusicPlayer'

type SoundboardTabProps = {
  audioEngine: AudioEngine
}

export default function SoundboardTab({ audioEngine }: SoundboardTabProps) {
  const { state, dispatch } = useMesa()

  const { slots, customSounds, recentMedia } = state.soundboard

  const boardSoundIds = useMemo(
    () => new Set(slots.map(s => s.soundId)),
    [slots]
  )

  function handleAddToBoard(soundId: string, isCustom: boolean) {
    const maxOrder = slots.length > 0
      ? Math.max(...slots.map(s => s.order))
      : -1
    const slot: SoundboardSlot = {
      id: `slot-${Date.now()}`,
      soundId,
      isCustom,
      preferredVariantId: null,
      order: maxOrder + 1,
    }
    dispatch({ type: 'ADD_SOUNDBOARD_SLOT', payload: { slot } })
  }

  function handleRemoveSlot(slotId: string) {
    audioEngine.stop(slots.find(s => s.id === slotId)?.soundId ?? '')
    dispatch({ type: 'REMOVE_SOUNDBOARD_SLOT', payload: { slotId } })
  }

  function handleReorder(reordered: SoundboardSlot[]) {
    dispatch({ type: 'REORDER_SOUNDBOARD_SLOTS', payload: { slots: reordered } })
  }

  function handleUpdateSlot(slotId: string, updates: Partial<SoundboardSlot>) {
    dispatch({ type: 'UPDATE_SOUNDBOARD_SLOT', payload: { slotId, updates } })
  }

  function handleAddCustomSound(sound: CustomSound) {
    dispatch({ type: 'ADD_CUSTOM_SOUND', payload: { sound } })
    handleAddToBoard(sound.id, true)
  }

  function handleRemoveCustomSound(id: string) {
    audioEngine.stop(id)
    dispatch({ type: 'REMOVE_CUSTOM_SOUND', payload: { soundId: id } })
  }

  function handleMediaAdd(media: RecentMedia) {
    dispatch({
      type: 'ADD_RECENT_MEDIA',
      payload: { media: { url: media.url, label: media.label, type: media.type } },
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-1.5">
      {/* Master controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] text-muted">Vol:</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(audioEngine.masterVolume * 100)}
          onChange={e => audioEngine.setMasterVolume(Number(e.target.value) / 100)}
          className="flex-1 h-1 accent-accent cursor-pointer"
        />
        <span className="text-[11px] text-muted w-7 text-right">
          {Math.round(audioEngine.masterVolume * 100)}%
        </span>
        {audioEngine.activeSounds.size > 0 && (
          <button
            onClick={() => audioEngine.stopAll()}
            className="text-[11px] text-red-400 hover:text-red-300 px-1.5 py-0.5
              border border-red-500/30 rounded transition-colors"
          >
            Parar ({audioEngine.activeSounds.size})
          </button>
        )}
      </div>

      {/* Main content: library + board */}
      <div className="flex-1 overflow-hidden flex gap-1.5 min-h-0">
        <div className="w-[40%] flex-shrink-0 overflow-hidden">
          <SoundLibrary
            customSounds={customSounds}
            boardSoundIds={boardSoundIds}
            onAddToBoard={handleAddToBoard}
            onAddCustomSound={handleAddCustomSound}
            onRemoveCustomSound={handleRemoveCustomSound}
          />
        </div>

        <PersonalBoard
          slots={slots}
          customSounds={customSounds}
          audioEngine={audioEngine}
          onReorder={handleReorder}
          onRemoveSlot={handleRemoveSlot}
          onUpdateSlot={handleUpdateSlot}
        />
      </div>

      {/* Music player */}
      <div className="flex-shrink-0 border-t border-stroke pt-1.5">
        <MusicPlayer
          recentMedia={recentMedia.map(m => ({ url: m.url, label: m.label, type: m.type }))}
          onMediaAdd={handleMediaAdd}
        />
      </div>
    </div>
  )
}
