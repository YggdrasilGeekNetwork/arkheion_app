import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import { mesaReducer, initialState, type MesaAction, type MesaState } from '~/reducers/mesaReducer'
import { DEFAULT_PARTY_SNAPSHOT_FIELDS, type PartySnapshotField } from '~/types/mesa'

const COMBAT_STATE_KEY = 'arkheion:combatState'

type MesaContextType = {
  state: MesaState
  dispatch: React.Dispatch<MesaAction>
}

const MesaContext = createContext<MesaContextType | null>(null)

export function MesaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mesaReducer, initialState)
  const restoredRef = useRef(false)

  // Initialize default snapshot fields on mount
  useEffect(() => {
    if (state.snapshotFields.length === 0) {
      const fieldsWithIds: PartySnapshotField[] = DEFAULT_PARTY_SNAPSHOT_FIELDS.map((field, index) => ({
        ...field,
        id: `field-${index}`,
      }))
      dispatch({ type: 'SET_SNAPSHOT_FIELDS', payload: fieldsWithIds })
    }
  }, [state.snapshotFields.length])

  // Restore combat state from sessionStorage on mount
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    try {
      const saved = sessionStorage.getItem(COMBAT_STATE_KEY)
      if (saved) {
        const combatState = JSON.parse(saved)
        dispatch({ type: 'RESTORE_COMBAT', payload: combatState })
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Persist combat state to sessionStorage on change
  useEffect(() => {
    if (state.combatState) {
      sessionStorage.setItem(COMBAT_STATE_KEY, JSON.stringify(state.combatState))
    } else {
      sessionStorage.removeItem(COMBAT_STATE_KEY)
    }
  }, [state.combatState])

  return (
    <MesaContext.Provider value={{ state, dispatch }}>
      {children}
    </MesaContext.Provider>
  )
}

export function useMesa() {
  const context = useContext(MesaContext)
  if (!context) {
    throw new Error('useMesa must be used within a MesaProvider')
  }
  return context
}
