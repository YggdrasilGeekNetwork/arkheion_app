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
import webStorage from 'redux-persist/lib/storage'
import { uiReducer } from './slices/uiSlice'
import { combatReducer } from './slices/combatSlice'
import { soundboardReducer } from './slices/soundboardSlice'
import { mesaReducer } from './slices/mesaSlice'
import { encountersReducer } from './slices/encountersSlice'
import { notesReducer } from './slices/notesSlice'
import { characterReducer } from './slices/characterSlice'
import { wizardReducer } from './slices/wizardSlice'
import { combatPersistenceMiddleware } from './middleware/combatPersistence'

// On the server (Remix SSR) localStorage doesn't exist.
// The noop storage lets the store initialise without errors;
// PersistGate handles rehydration from the real storage after hydration.
const noopStorage = {
  getItem: (_key: string) => Promise.resolve(null),
  setItem: (_key: string, _value: string) => Promise.resolve(),
  removeItem: (_key: string) => Promise.resolve(),
}

const storage = typeof window !== 'undefined' ? webStorage : noopStorage

const rootReducer = combineReducers({
  ui: persistReducer({ key: 'ui', storage, version: 1 }, uiReducer),
  soundboard: persistReducer({ key: 'soundboard', storage, version: 1 }, soundboardReducer),
  combat: combatReducer,
  mesa: mesaReducer,
  encounters: encountersReducer,
  notes: notesReducer,
  character: characterReducer,
  wizard: persistReducer({ key: 'wizard', storage, version: 1 }, wizardReducer),
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
