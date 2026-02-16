import { useState, useMemo } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import { DEFAULT_PLAYLISTS } from '~/data/soundEffects'
import type { AudioEngine } from './soundboard/useAudioEngine'
import type { SoundboardSlot, CustomSound, PlaylistSlot, PlaylistDefinition } from '~/types/soundboard'
import PersonalBoard from './soundboard/PersonalBoard'
import SoundLibrary from './soundboard/SoundLibrary'
import MusicPlayer from './MusicPlayer'

type SoundboardTabProps = {
  audioEngine: AudioEngine
}

export default function SoundboardTab({ audioEngine }: SoundboardTabProps) {
  const { state, dispatch } = useMesa()
  const [editMode, setEditMode] = useState(false)
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)

  const { slots, customSounds, playlistSlots, customPlaylists } = state.soundboard

  const boardSoundIds = useMemo(
    () => new Set(slots.map(s => s.soundId)),
    [slots]
  )

  const allPlaylists = useMemo(
    () => [...DEFAULT_PLAYLISTS, ...customPlaylists],
    [customPlaylists]
  )

  const activePlaylistUrl = useMemo(() => {
    if (!activePlaylistId) return null
    return allPlaylists.find(p => p.id === activePlaylistId)?.url ?? null
  }, [activePlaylistId, allPlaylists])

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

  function handleAddPlaylistToBoard(playlistId: string, isCustom: boolean) {
    const maxOrder = playlistSlots.length > 0
      ? Math.max(...playlistSlots.map(s => s.order))
      : -1
    const slot: PlaylistSlot = {
      id: `pslot-${Date.now()}`,
      playlistId,
      isCustom,
      order: maxOrder + 1,
    }
    dispatch({ type: 'ADD_PLAYLIST_SLOT', payload: { slot } })
  }

  function handleRemovePlaylistSlot(slotId: string) {
    const slot = playlistSlots.find(s => s.id === slotId)
    if (slot && activePlaylistId === slot.playlistId) {
      setActivePlaylistId(null)
    }
    dispatch({ type: 'REMOVE_PLAYLIST_SLOT', payload: { slotId } })
  }

  function handleAddCustomPlaylist(playlist: PlaylistDefinition) {
    dispatch({ type: 'ADD_CUSTOM_PLAYLIST', payload: { playlist } })
  }

  function handleRemoveCustomPlaylist(id: string) {
    if (activePlaylistId === id) setActivePlaylistId(null)
    dispatch({ type: 'REMOVE_CUSTOM_PLAYLIST', payload: { playlistId: id } })
  }

  function handlePlaylistToggle(playlistId: string) {
    setActivePlaylistId(prev => prev === playlistId ? null : playlistId)
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
        <button
          onClick={() => setEditMode(v => !v)}
          className={`text-[11px] px-1.5 py-0.5 rounded transition-colors ${
            editMode
              ? 'bg-accent/20 text-accent border border-accent/40'
              : 'text-muted hover:text-fg border border-stroke hover:border-accent/30'
          }`}
        >
          {editMode ? 'Fechar' : 'Editar'}
        </button>
      </div>

      {/* Main content: library (when editing) + board */}
      <div className="flex-1 overflow-hidden flex gap-1.5 min-h-0">
        {editMode && (
          <div className="w-[30%] flex-shrink-0 overflow-hidden">
            <SoundLibrary
              customSounds={customSounds}
              boardSoundIds={boardSoundIds}
              onAddToBoard={handleAddToBoard}
              onAddCustomSound={handleAddCustomSound}
              onRemoveCustomSound={handleRemoveCustomSound}
              playlistSlots={playlistSlots}
              customPlaylists={customPlaylists}
              onAddPlaylistToBoard={handleAddPlaylistToBoard}
              onAddCustomPlaylist={handleAddCustomPlaylist}
              onRemoveCustomPlaylist={handleRemoveCustomPlaylist}
            />
          </div>
        )}

        <PersonalBoard
          slots={slots}
          customSounds={customSounds}
          editMode={editMode}
          audioEngine={audioEngine}
          onReorder={handleReorder}
          onRemoveSlot={handleRemoveSlot}
          onUpdateSlot={handleUpdateSlot}
          playlistSlots={playlistSlots}
          customPlaylists={customPlaylists}
          activePlaylistId={activePlaylistId}
          onPlaylistToggle={handlePlaylistToggle}
          onRemovePlaylistSlot={handleRemovePlaylistSlot}
        />
      </div>

      {/* Music player embed */}
      {activePlaylistUrl && (
        <div className="flex-shrink-0 border-t border-stroke pt-1.5">
          <MusicPlayer
            activeUrl={activePlaylistUrl}
            onClose={() => setActivePlaylistId(null)}
          />
        </div>
      )}
    </div>
  )
}
