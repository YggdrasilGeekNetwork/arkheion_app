import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SoundboardConfig, SoundboardSlot, CustomSound, RecentMediaEntry, PlaylistSlot, PlaylistDefinition } from '~/types/soundboard'
import { DEFAULT_SOUNDBOARD_SLOTS, DEFAULT_PLAYLIST_SLOTS } from '~/data/soundEffects'

const initialState: SoundboardConfig = {
  slots: DEFAULT_SOUNDBOARD_SLOTS,
  customSounds: [],
  recentMedia: [],
  playlistSlots: DEFAULT_PLAYLIST_SLOTS,
  customPlaylists: [],
}

const soundboardSlice = createSlice({
  name: 'soundboard',
  initialState,
  reducers: {
    addSlot(state, action: PayloadAction<{ slot: SoundboardSlot }>) {
      state.slots.push(action.payload.slot)
    },
    removeSlot(state, action: PayloadAction<{ slotId: string }>) {
      state.slots = state.slots.filter(s => s.id !== action.payload.slotId)
    },
    reorderSlots(state, action: PayloadAction<{ slots: SoundboardSlot[] }>) {
      state.slots = action.payload.slots
    },
    updateSlot(state, action: PayloadAction<{ slotId: string; updates: Partial<SoundboardSlot> }>) {
      const slot = state.slots.find(s => s.id === action.payload.slotId)
      if (slot) Object.assign(slot, action.payload.updates)
    },
    addCustomSound(state, action: PayloadAction<{ sound: CustomSound }>) {
      state.customSounds.push(action.payload.sound)
    },
    removeCustomSound(state, action: PayloadAction<{ soundId: string }>) {
      state.customSounds = state.customSounds.filter(s => s.id !== action.payload.soundId)
      state.slots = state.slots.filter(s => !(s.isCustom && s.soundId === action.payload.soundId))
    },
    addRecentMedia(state, action: PayloadAction<{ media: RecentMediaEntry }>) {
      const filtered = state.recentMedia.filter(m => m.url !== action.payload.media.url)
      state.recentMedia = [action.payload.media, ...filtered].slice(0, 5)
    },
    addPlaylistSlot(state, action: PayloadAction<{ slot: PlaylistSlot }>) {
      state.playlistSlots.push(action.payload.slot)
    },
    removePlaylistSlot(state, action: PayloadAction<{ slotId: string }>) {
      state.playlistSlots = state.playlistSlots.filter(s => s.id !== action.payload.slotId)
    },
    addCustomPlaylist(state, action: PayloadAction<{ playlist: PlaylistDefinition }>) {
      state.customPlaylists.push(action.payload.playlist)
    },
    removeCustomPlaylist(state, action: PayloadAction<{ playlistId: string }>) {
      state.customPlaylists = state.customPlaylists.filter(p => p.id !== action.payload.playlistId)
      state.playlistSlots = state.playlistSlots.filter(
        s => !(s.isCustom && s.playlistId === action.payload.playlistId)
      )
    },
  },
})

export const soundboardActions = soundboardSlice.actions
export const soundboardReducer = soundboardSlice.reducer
