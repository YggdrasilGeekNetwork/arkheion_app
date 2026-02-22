import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_PARTY_SNAPSHOT_FIELDS, type PartySnapshotField } from '~/types/mesa'

type UIState = {
  snapshotFields: PartySnapshotField[]
}

const initialState: UIState = {
  snapshotFields: DEFAULT_PARTY_SNAPSHOT_FIELDS.map((field, index) => ({
    ...field,
    id: `field-${index}`,
  })),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSnapshotFields(state, action: PayloadAction<PartySnapshotField[]>) {
      state.snapshotFields = action.payload
    },
    toggleFieldVisibility(state, action: PayloadAction<string>) {
      const field = state.snapshotFields.find(f => f.id === action.payload)
      if (field) field.visible = !field.visible
    },
  },
})

export const uiActions = uiSlice.actions
export const uiReducer = uiSlice.reducer
export type { UIState }
