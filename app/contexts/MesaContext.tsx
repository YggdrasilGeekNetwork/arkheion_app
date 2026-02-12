import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { mesaReducer, initialState, type MesaAction, type MesaState } from '~/reducers/mesaReducer'
import { DEFAULT_PARTY_SNAPSHOT_FIELDS, type PartySnapshotField } from '~/types/mesa'

type MesaContextType = {
  state: MesaState
  dispatch: React.Dispatch<MesaAction>
}

const MesaContext = createContext<MesaContextType | null>(null)

export function MesaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mesaReducer, initialState)

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
