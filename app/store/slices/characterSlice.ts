import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Character, EquippedItems, Currencies, AvailableActions, Attribute, Resistance, Skill, CombatAction, WeaponAttack, Ability, Spell, CharacterNotesData } from '~/types/character'
import type { LevelUpData } from '~/types/levelup'
import { getModifierFromValue } from '~/types/levelup'

// optimisticUpdates uses Record (not Map) for Redux serialization
type CharacterSliceState = {
  character: Character | null
  optimisticUpdates: Record<string, Partial<Character>>
  previousState: Character | null
  isLoading: boolean
  error: string | null
}

const initialState: CharacterSliceState = {
  character: null,
  optimisticUpdates: {},
  previousState: null,
  isLoading: false,
  error: null,
}

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    setCharacter(state, action: PayloadAction<Character>) {
      state.previousState = state.character
      state.character = action.payload
      state.isLoading = false
      state.error = null
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.isLoading = false
    },
    updateHealth(state, action: PayloadAction<number>) {
      if (!state.character) return
      state.character.health = Math.max(-100, action.payload)
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateMana(state, action: PayloadAction<number>) {
      if (!state.character) return
      state.character.mana = Math.max(0, action.payload)
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateEquippedItems(state, action: PayloadAction<EquippedItems>) {
      if (!state.character) return
      state.character.equippedItems = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateBackpack(state, action: PayloadAction<Character['backpack']>) {
      if (!state.character) return
      state.character.backpack = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateCurrencies(state, action: PayloadAction<Currencies>) {
      if (!state.character) return
      state.character.currencies = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateAvailableActions(state, action: PayloadAction<Partial<AvailableActions>>) {
      if (!state.character) return
      state.character.availableActions = { ...state.character.availableActions, ...action.payload }
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateInitiativeRoll(state, action: PayloadAction<number>) {
      if (!state.character) return
      state.character.initiativeRoll = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    startTurn(state) {
      if (!state.character) return
      state.character.isMyTurn = true
      state.character.availableActions = { standard: 1, movement: 1, free: 1, full: 1, reaction: 1 }
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    endTurn(state) {
      if (!state.character) return
      state.character.isMyTurn = false
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    toggleCombat(state, action: PayloadAction<boolean>) {
      if (!state.character) return
      state.character.inCombat = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    resetActions(state) {
      if (!state.character) return
      state.character.availableActions = { standard: 1, movement: 1, free: 1, full: 1, reaction: 1 }
      state.character.isMyTurn = false
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateAttributes(state, action: PayloadAction<Attribute[]>) {
      if (!state.character) return
      state.character.attributes = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateResistances(state, action: PayloadAction<Resistance[]>) {
      if (!state.character) return
      state.character.resistances = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateSkills(state, action: PayloadAction<Skill[]>) {
      if (!state.character) return
      state.character.skills = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateActionsList(state, action: PayloadAction<CombatAction[]>) {
      if (!state.character) return
      state.character.actionsList = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateWeapons(state, action: PayloadAction<WeaponAttack[]>) {
      if (!state.character) return
      state.character.weapons = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateAbilities(state, action: PayloadAction<Ability[]>) {
      if (!state.character) return
      state.character.abilities = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateNotes(state, action: PayloadAction<CharacterNotesData>) {
      if (!state.character) return
      state.character.notes = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    updateSpells(state, action: PayloadAction<Spell[]>) {
      if (!state.character) return
      state.character.spells = action.payload
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    levelUp(state, action: PayloadAction<LevelUpData>) {
      if (!state.character) return
      const levelUpData = action.payload

      // Update classes
      const existingClass = state.character.classes.find(c => c.name === levelUpData.className)
      if (existingClass) {
        existingClass.level = levelUpData.newLevel
      } else {
        state.character.classes.push({ name: levelUpData.className, level: levelUpData.newLevel })
      }

      // Update attribute if increased
      if (levelUpData.attributeIncrease) {
        const attr = state.character.attributes.find(a => a.label === levelUpData.attributeIncrease?.attribute)
        if (attr) {
          attr.value += 1
          attr.modifier = getModifierFromValue(attr.value)
        }
      }

      // Add new abilities
      state.character.abilities = [
        ...(state.character.abilities || []),
        ...levelUpData.newAbilities,
      ]

      // Mark new skills as trained
      if (levelUpData.newSkills.length > 0) {
        for (const skill of state.character.skills) {
          if (levelUpData.newSkills.includes(skill.name)) skill.trained = true
        }
      }

      state.character.maxHealth += levelUpData.hpGained
      state.character.health += levelUpData.hpGained
      state.character.maxMana += levelUpData.mpGained
      state.character.mana += levelUpData.mpGained
      state.character.version += 1
      state.character.updatedAt = new Date().toISOString()
    },
    optimisticUpdate(state, action: PayloadAction<{ id: string; update: Partial<Character> }>) {
      if (!state.character) return
      state.optimisticUpdates[action.payload.id] = action.payload.update
      Object.assign(state.character, action.payload.update)
    },
    revertOptimistic(state, action: PayloadAction<string>) {
      if (!state.character || !state.previousState) return
      delete state.optimisticUpdates[action.payload]
      state.character = state.previousState
    },
    confirmOptimistic(state, action: PayloadAction<string>) {
      delete state.optimisticUpdates[action.payload]
      state.previousState = state.character
    },
  },
})

export const characterActions = characterSlice.actions
export const characterReducer = characterSlice.reducer
export type { CharacterSliceState }
