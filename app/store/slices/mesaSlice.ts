import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Character } from '~/types/character'
import type { MesaWithCharacters } from '~/types/mesa'

type MesaSliceState = {
  mesa: MesaWithCharacters | null
  isLoading: boolean
  error: string | null
}

const initialState: MesaSliceState = {
  mesa: null,
  isLoading: false,
  error: null,
}

const mesaSlice = createSlice({
  name: 'mesa',
  initialState,
  reducers: {
    setMesa(state, action: PayloadAction<MesaWithCharacters>) {
      state.mesa = action.payload
      state.isLoading = false
      state.error = null
    },
    clearMesa(state) {
      state.mesa = null
    },
    updateCharacter(state, action: PayloadAction<{ characterId: string; data: Partial<Character> }>) {
      if (!state.mesa) return
      const char = state.mesa.characters.find(c => c.id === action.payload.characterId)
      if (char) Object.assign(char, action.payload.data)
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.isLoading = false
    },
  },
})

export const mesaActions = mesaSlice.actions
export const mesaReducer = mesaSlice.reducer
export type { MesaSliceState }
