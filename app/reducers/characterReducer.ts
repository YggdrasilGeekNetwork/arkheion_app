import type { Character, EquippedItems, Currencies, AvailableActions, Attribute, Resistance, Skill, CombatAction, WeaponAttack, Ability } from '~/types/character'

export type CharacterAction =
  | { type: 'SET_CHARACTER'; payload: Character }
  | { type: 'UPDATE_HEALTH'; payload: number }
  | { type: 'UPDATE_MANA'; payload: number }
  | { type: 'UPDATE_EQUIPPED_ITEMS'; payload: EquippedItems }
  | { type: 'UPDATE_BACKPACK'; payload: (Character.prototype.backpack) }
  | { type: 'UPDATE_CURRENCIES'; payload: Currencies }
  | { type: 'UPDATE_AVAILABLE_ACTIONS'; payload: Partial<AvailableActions> }
  | { type: 'UPDATE_INITIATIVE_ROLL'; payload: number }
  | { type: 'START_TURN' }
  | { type: 'END_TURN' }
  | { type: 'TOGGLE_COMBAT'; payload: boolean }
  | { type: 'RESET_ACTIONS' }
  | { type: 'UPDATE_ATTRIBUTES'; payload: Attribute[] }
  | { type: 'UPDATE_RESISTANCES'; payload: Resistance[] }
  | { type: 'UPDATE_SKILLS'; payload: Skill[] }
  | { type: 'UPDATE_ACTIONS_LIST'; payload: CombatAction[] }
  | { type: 'UPDATE_WEAPONS'; payload: WeaponAttack[] }
  | { type: 'UPDATE_ABILITIES'; payload: Ability[] }
  | { type: 'OPTIMISTIC_UPDATE'; payload: { id: string; update: Partial<Character> } }
  | { type: 'REVERT_OPTIMISTIC'; payload: string }
  | { type: 'CONFIRM_OPTIMISTIC'; payload: string }

export type CharacterState = {
  character: Character | null
  optimisticUpdates: Map<string, Partial<Character>>
  previousState: Character | null
}

export const initialState: CharacterState = {
  character: null,
  optimisticUpdates: new Map(),
  previousState: null,
}

export function characterReducer(state: CharacterState, action: CharacterAction): CharacterState {
  switch (action.type) {
    case 'SET_CHARACTER':
      return {
        ...state,
        character: action.payload,
        previousState: state.character,
      }

    case 'UPDATE_HEALTH':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          health: Math.max(-100, action.payload),
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_MANA':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          mana: Math.max(0, action.payload),
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_EQUIPPED_ITEMS':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          equippedItems: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_BACKPACK':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          backpack: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_CURRENCIES':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          currencies: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_AVAILABLE_ACTIONS':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          availableActions: {
            ...state.character.availableActions,
            ...action.payload,
          },
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_INITIATIVE_ROLL':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          initiativeRoll: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'START_TURN':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          isMyTurn: true,
          availableActions: {
            standard: 1,
            movement: 1,
            free: 1,
            full: 1,
            reactions: 1,
          },
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'END_TURN':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          isMyTurn: false,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'TOGGLE_COMBAT':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          inCombat: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'RESET_ACTIONS':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          availableActions: {
            standard: 1,
            movement: 1,
            free: 1,
            full: 1,
            reactions: 1,
          },
          isMyTurn: false,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_ATTRIBUTES':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          attributes: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_RESISTANCES':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          resistances: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_SKILLS':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          skills: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_ACTIONS_LIST':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          actionsList: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_WEAPONS':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          weapons: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'UPDATE_ABILITIES':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          abilities: action.payload,
          version: state.character.version + 1,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'OPTIMISTIC_UPDATE':
      if (!state.character) return state
      const newOptimisticUpdates = new Map(state.optimisticUpdates)
      newOptimisticUpdates.set(action.payload.id, action.payload.update)
      return {
        ...state,
        character: {
          ...state.character,
          ...action.payload.update,
        },
        optimisticUpdates: newOptimisticUpdates,
      }

    case 'REVERT_OPTIMISTIC':
      if (!state.character || !state.previousState) return state
      const revertUpdates = new Map(state.optimisticUpdates)
      revertUpdates.delete(action.payload)
      return {
        ...state,
        character: state.previousState,
        optimisticUpdates: revertUpdates,
      }

    case 'CONFIRM_OPTIMISTIC':
      const confirmUpdates = new Map(state.optimisticUpdates)
      confirmUpdates.delete(action.payload)
      return {
        ...state,
        optimisticUpdates: confirmUpdates,
        previousState: state.character,
      }

    default:
      return state
  }
}
