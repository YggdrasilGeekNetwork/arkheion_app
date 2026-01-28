import { createContext, useContext, useReducer, useCallback, useRef, type ReactNode } from 'react'
import { characterReducer, initialState, type CharacterAction, type CharacterState } from '~/reducers/characterReducer'
import type { Character } from '~/types/character'
import { updateCharacter } from '~/utils/api'
import { useToast } from './ToastContext'

type CharacterContextType = {
  state: CharacterState
  dispatch: React.Dispatch<CharacterAction>
  optimisticDispatch: (action: CharacterAction, updateId?: string) => Promise<void>
}

const CharacterContext = createContext<CharacterContextType | null>(null)

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(characterReducer, initialState)
  const { addToast } = useToast()

  // Keep track of pending updates by character ID and action type
  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Debounced backend update function
  const debouncedBackendUpdate = useCallback(
    (characterId: string, update: Partial<Character>, updateKey: string) => {
      // Clear existing timeout for this specific update type
      const existingTimeout = pendingUpdatesRef.current.get(updateKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set new timeout
      const timeout = setTimeout(async () => {
        try {
          await updateCharacter(characterId, update)
          pendingUpdatesRef.current.delete(updateKey)

          // Show success toast for certain actions
          // if (updateKey.includes('HEALTH') || updateKey.includes('MANA')) {
          //   addToast('Alterações salvas', 'success', 2000)
          // }
        } catch (error) {
          console.error('Failed to update character:', error)

          // Show error toast
          const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar alterações'
          addToast(`Falha ao salvar: ${errorMessage}`, 'error', 5000)

          // Revert optimistic update
          dispatch({ type: 'REVERT_OPTIMISTIC', payload: updateKey })
        }
      }, 1000) // 1 second debounce

      pendingUpdatesRef.current.set(updateKey, timeout)
    },
    [addToast]
  )

  const optimisticDispatch = useCallback(
    async (action: CharacterAction, updateId?: string) => {
      const id = updateId || `update-${Date.now()}-${Math.random()}`

      // Apply the action optimistically (UI updates immediately)
      dispatch(action)

      // If there's a character, send the update to the backend (debounced)
      if (state.character) {
        try {
          // Extract the update from the action
          let update: Partial<Character> = {}
          let updateKey = `${state.character.id}-${action.type}`

          switch (action.type) {
            case 'UPDATE_HEALTH':
              update = { health: action.payload }
              updateKey = `${state.character.id}-HEALTH`
              break
            case 'UPDATE_MANA':
              update = { mana: action.payload }
              updateKey = `${state.character.id}-MANA`
              break
            case 'UPDATE_EQUIPPED_ITEMS':
              update = { equippedItems: action.payload }
              updateKey = `${state.character.id}-EQUIPPED_ITEMS`
              break
            case 'UPDATE_BACKPACK':
              update = { backpack: action.payload }
              updateKey = `${state.character.id}-BACKPACK`
              break
            case 'UPDATE_CURRENCIES':
              update = { currencies: action.payload }
              updateKey = `${state.character.id}-CURRENCIES`
              break
            case 'UPDATE_AVAILABLE_ACTIONS':
              update = { availableActions: { ...state.character.availableActions, ...action.payload } }
              updateKey = `${state.character.id}-ACTIONS`
              break
            case 'UPDATE_INITIATIVE_ROLL':
              update = { initiativeRoll: action.payload }
              updateKey = `${state.character.id}-INITIATIVE`
              break
            case 'START_TURN': {
              // Calcular reações baseado em DES/2 (mínimo 1)
              const desAttribute = state.character.attributes.find(attr => attr.label === 'DES')
              const desValue = desAttribute?.value || 10
              const reaction = Math.max(1, Math.floor(desValue / 2))

              update = {
                isMyTurn: true,
                availableActions: { standard: 1, movement: 1, free: 1, full: 1, reaction }
              }
              updateKey = `${state.character.id}-START_TURN`
              break
            }
            case 'END_TURN':
              update = { isMyTurn: false }
              updateKey = `${state.character.id}-END_TURN`
              break
            case 'UPDATE_ATTRIBUTES':
              update = { attributes: action.payload }
              updateKey = `${state.character.id}-ATTRIBUTES`
              break
            case 'UPDATE_RESISTANCES':
              update = { resistances: action.payload }
              updateKey = `${state.character.id}-RESISTANCES`
              break
            case 'UPDATE_SKILLS':
              update = { skills: action.payload }
              updateKey = `${state.character.id}-SKILLS`
              break
            case 'UPDATE_ACTIONS_LIST':
              update = { actionsList: action.payload }
              updateKey = `${state.character.id}-ACTIONS_LIST`
              break
            case 'UPDATE_WEAPONS':
              update = { weapons: action.payload }
              updateKey = `${state.character.id}-WEAPONS`
              break
          }

          // Debounced backend update
          debouncedBackendUpdate(state.character.id, update, updateKey)
        } catch (error) {
          console.error('Failed to dispatch optimistic update:', error)
          addToast('Erro ao processar atualização', 'error', 5000)
        }
      }
    },
    [state.character, debouncedBackendUpdate, addToast]
  )

  return (
    <CharacterContext.Provider value={{ state, dispatch, optimisticDispatch }}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacter() {
  const context = useContext(CharacterContext)
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider')
  }
  return context
}
