import { createContext, useContext, useCallback, useRef, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { characterActions } from '~/store/slices/characterSlice'
import type { CharacterAction, CharacterState } from '~/reducers/characterReducer'
import type { Character } from '~/types/character'
import { updateCharacter } from '~/utils/api'
import { useToast } from './ToastContext'

type CharacterContextType = {
  state: CharacterState
  dispatch: (action: CharacterAction) => void
  optimisticDispatch: (action: CharacterAction, updateId?: string) => Promise<void>
}

const CharacterContext = createContext<CharacterContextType | null>(null)

export function CharacterProvider({ children }: { children: ReactNode }) {
  const appDispatch = useAppDispatch()
  const { addToast } = useToast()

  // Read character state from Redux
  const reduxState = useAppSelector(s => s.character)

  // Adapt Redux state to CharacterState shape (optimisticUpdates as Map for type compat)
  const state: CharacterState = {
    character: reduxState.character,
    optimisticUpdates: new Map(Object.entries(reduxState.optimisticUpdates)),
    previousState: reduxState.previousState,
  }

  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const debouncedBackendUpdate = useCallback(
    (characterId: string, update: Partial<Character>, updateKey: string) => {
      const existingTimeout = pendingUpdatesRef.current.get(updateKey)
      if (existingTimeout) clearTimeout(existingTimeout)

      const timeout = setTimeout(async () => {
        try {
          await updateCharacter(characterId, update)
          pendingUpdatesRef.current.delete(updateKey)
        } catch (error) {
          console.error('Failed to update character:', error)
          const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar alterações'
          addToast(`Falha ao salvar: ${errorMessage}`, 'error', 5000)
          appDispatch(characterActions.revertOptimistic(updateKey))
        }
      }, 1000)

      pendingUpdatesRef.current.set(updateKey, timeout)
    },
    [addToast, appDispatch]
  )

  // Route CharacterAction to Redux slice actions
  const dispatch = useCallback((action: CharacterAction) => {
    switch (action.type) {
      case 'SET_CHARACTER': appDispatch(characterActions.setCharacter(action.payload)); break
      case 'UPDATE_HEALTH': appDispatch(characterActions.updateHealth(action.payload)); break
      case 'UPDATE_MANA': appDispatch(characterActions.updateMana(action.payload)); break
      case 'UPDATE_EQUIPPED_ITEMS': appDispatch(characterActions.updateEquippedItems(action.payload)); break
      case 'UPDATE_BACKPACK': appDispatch(characterActions.updateBackpack(action.payload)); break
      case 'UPDATE_CURRENCIES': appDispatch(characterActions.updateCurrencies(action.payload)); break
      case 'UPDATE_AVAILABLE_ACTIONS': appDispatch(characterActions.updateAvailableActions(action.payload)); break
      case 'UPDATE_INITIATIVE_ROLL': appDispatch(characterActions.updateInitiativeRoll(action.payload)); break
      case 'START_TURN': appDispatch(characterActions.startTurn()); break
      case 'END_TURN': appDispatch(characterActions.endTurn()); break
      case 'TOGGLE_COMBAT': appDispatch(characterActions.toggleCombat(action.payload)); break
      case 'RESET_ACTIONS': appDispatch(characterActions.resetActions()); break
      case 'UPDATE_ATTRIBUTES': appDispatch(characterActions.updateAttributes(action.payload)); break
      case 'UPDATE_RESISTANCES': appDispatch(characterActions.updateResistances(action.payload)); break
      case 'UPDATE_SKILLS': appDispatch(characterActions.updateSkills(action.payload)); break
      case 'UPDATE_ACTIONS_LIST': appDispatch(characterActions.updateActionsList(action.payload)); break
      case 'UPDATE_WEAPONS': appDispatch(characterActions.updateWeapons(action.payload)); break
      case 'UPDATE_ABILITIES': appDispatch(characterActions.updateAbilities(action.payload)); break
      case 'UPDATE_SPELLS': appDispatch(characterActions.updateSpells(action.payload)); break
      case 'UPDATE_NOTES': appDispatch(characterActions.updateNotes(action.payload)); break
      case 'LEVEL_UP': appDispatch(characterActions.levelUp(action.payload)); break
      case 'OPTIMISTIC_UPDATE': appDispatch(characterActions.optimisticUpdate(action.payload)); break
      case 'REVERT_OPTIMISTIC': appDispatch(characterActions.revertOptimistic(action.payload)); break
      case 'CONFIRM_OPTIMISTIC': appDispatch(characterActions.confirmOptimistic(action.payload)); break
    }
  }, [appDispatch])

  const optimisticDispatch = useCallback(
    async (action: CharacterAction, updateId?: string) => {
      const id = updateId || `update-${Date.now()}-${Math.random()}`

      // Apply the action optimistically (UI updates immediately)
      dispatch(action)

      const character = reduxState.character
      if (character) {
        try {
          let update: Partial<Character> = {}
          let updateKey = `${character.id}-${action.type}`

          switch (action.type) {
            case 'UPDATE_HEALTH':
              update = { health: action.payload }
              updateKey = `${character.id}-HEALTH`
              break
            case 'UPDATE_MANA':
              update = { mana: action.payload }
              updateKey = `${character.id}-MANA`
              break
            case 'UPDATE_EQUIPPED_ITEMS':
              update = { equippedItems: action.payload }
              updateKey = `${character.id}-EQUIPPED_ITEMS`
              break
            case 'UPDATE_BACKPACK':
              update = { backpack: action.payload }
              updateKey = `${character.id}-BACKPACK`
              break
            case 'UPDATE_CURRENCIES':
              update = { currencies: action.payload }
              updateKey = `${character.id}-CURRENCIES`
              break
            case 'UPDATE_AVAILABLE_ACTIONS':
              update = { availableActions: { ...character.availableActions, ...action.payload } }
              updateKey = `${character.id}-ACTIONS`
              break
            case 'UPDATE_INITIATIVE_ROLL':
              update = { initiativeRoll: action.payload }
              updateKey = `${character.id}-INITIATIVE`
              break
            case 'START_TURN': {
              const desAttribute = character.attributes.find(attr => attr.label === 'DES')
              const desValue = desAttribute?.value || 10
              const reaction = Math.max(1, Math.floor(desValue / 2))
              update = { isMyTurn: true, availableActions: { standard: 1, movement: 1, free: 1, full: 1, reaction } }
              updateKey = `${character.id}-START_TURN`
              break
            }
            case 'END_TURN':
              update = { isMyTurn: false }
              updateKey = `${character.id}-END_TURN`
              break
            case 'UPDATE_ATTRIBUTES':
              update = { attributes: action.payload }
              updateKey = `${character.id}-ATTRIBUTES`
              break
            case 'UPDATE_RESISTANCES':
              update = { resistances: action.payload }
              updateKey = `${character.id}-RESISTANCES`
              break
            case 'UPDATE_SKILLS':
              update = { skills: action.payload }
              updateKey = `${character.id}-SKILLS`
              break
            case 'UPDATE_ACTIONS_LIST':
              update = { actionsList: action.payload }
              updateKey = `${character.id}-ACTIONS_LIST`
              break
            case 'UPDATE_WEAPONS':
              update = { weapons: action.payload }
              updateKey = `${character.id}-WEAPONS`
              break
            case 'UPDATE_NOTES':
              update = { notes: action.payload }
              updateKey = `${character.id}-NOTES`
              break
            case 'LEVEL_UP':
              update = {} as Partial<Character>
              updateKey = `${character.id}-LEVEL_UP`
              break
          }

          debouncedBackendUpdate(character.id, update, updateKey)
        } catch (error) {
          console.error('Failed to dispatch optimistic update:', error)
          addToast('Erro ao processar atualização', 'error', 5000)
        }
      }
    },
    [reduxState.character, dispatch, debouncedBackendUpdate, addToast]
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
