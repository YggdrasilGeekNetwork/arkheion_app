import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { uiReducer } from './slices/uiSlice'
import { combatReducer } from './slices/combatSlice'
import { soundboardReducer } from './slices/soundboardSlice'
import { mesaReducer } from './slices/mesaSlice'
import { encountersReducer } from './slices/encountersSlice'
import { notesReducer } from './slices/notesSlice'
import { characterReducer } from './slices/characterSlice'
import { wizardReducer } from './slices/wizardSlice'
import { combatPersistenceMiddleware } from './middleware/combatPersistence'

// Persist soundboard and UI state to localStorage
const persistedSoundboard = persistReducer(
  { key: 'soundboard', storage, version: 1 },
  soundboardReducer,
)
const persistedUi = persistReducer(
  { key: 'ui', storage, version: 1 },
  uiReducer,
)

const rootReducer = combineReducers({
  ui: persistedUi,
  combat: combatReducer,
  soundboard: persistedSoundboard,
  mesa: mesaReducer,
  encounters: encountersReducer,
  notes: notesReducer,
  character: characterReducer,
  wizard: wizardReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(combatPersistenceMiddleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
