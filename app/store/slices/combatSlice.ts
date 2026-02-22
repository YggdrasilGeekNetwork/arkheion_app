import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CombatState, InitiativeEntry } from '~/types/combat'

type CombatSliceState = {
  combatState: CombatState | null
}

function sortInitiativeOrder(entries: InitiativeEntry[]): InitiativeEntry[] {
  return [...entries].sort((a, b) => {
    const aInit = a.initiative ?? -999
    const bInit = b.initiative ?? -999
    if (bInit !== aInit) return bInit - aInit
    const typePriority = { player: 0, npc: 1, enemy: 2 }
    return typePriority[a.type] - typePriority[b.type]
  })
}

function findNextAliveIndex(
  entries: InitiativeEntry[],
  fromIndex: number,
  direction: 1 | -1,
): { index: number; newRound: boolean } {
  const len = entries.length
  if (len === 0) return { index: 0, newRound: false }
  let idx = fromIndex
  let wrapped = false
  for (let i = 0; i < len; i++) {
    idx += direction
    if (idx >= len) { idx = 0; wrapped = true }
    if (idx < 0) { idx = len - 1; wrapped = true }
    if (!entries[idx].isDefeated) return { index: idx, newRound: wrapped && direction === 1 }
  }
  return { index: fromIndex, newRound: false }
}

const initialState: CombatSliceState = {
  combatState: null,
}

const combatSlice = createSlice({
  name: 'combat',
  initialState,
  reducers: {
    startCombat(state, action: PayloadAction<{ encounterId: string; initiativeOrder: InitiativeEntry[] }>) {
      state.combatState = {
        encounterId: action.payload.encounterId,
        status: 'rolling_initiative',
        round: 1,
        currentTurnIndex: 0,
        initiativeOrder: action.payload.initiativeOrder,
      }
    },
    endCombat(state) {
      state.combatState = null
    },
    restoreCombat(state, action: PayloadAction<CombatState>) {
      const payload = action.payload
      if (payload.status === 'in_progress' && payload.initiativeOrder.length > 0) {
        const first = payload.initiativeOrder[payload.currentTurnIndex]
        if (first && !first.availableActions) {
          state.combatState = {
            ...payload,
            initiativeOrder: payload.initiativeOrder.map((e, i) =>
              i === payload.currentTurnIndex
                ? { ...e, availableActions: { standard: 1, movement: 1, free: 3 } }
                : e
            ),
          }
          return
        }
      }
      state.combatState = payload
    },
    setInitiative(state, action: PayloadAction<{ entryId: string; initiative: number }>) {
      if (!state.combatState) return
      const updated = state.combatState.initiativeOrder.map(e =>
        e.id === action.payload.entryId ? { ...e, initiative: action.payload.initiative } : e
      )
      const allSet = updated.every(e => e.initiative !== null)
      const sorted = allSet ? sortInitiativeOrder(updated) : updated
      state.combatState.initiativeOrder = sorted
      state.combatState.status = allSet ? 'in_progress' : state.combatState.status
      state.combatState.currentTurnIndex = 0
    },
    nextTurn(state) {
      if (!state.combatState || state.combatState.status !== 'in_progress') return
      const { index, newRound } = findNextAliveIndex(
        state.combatState.initiativeOrder,
        state.combatState.currentTurnIndex,
        1,
      )
      state.combatState.currentTurnIndex = index
      if (newRound) state.combatState.round += 1
      const entry = state.combatState.initiativeOrder[index]
      if (entry) entry.availableActions = { standard: 1, movement: 1, free: 3 }
    },
    previousTurn(state) {
      if (!state.combatState || state.combatState.status !== 'in_progress') return
      const { index, newRound } = findNextAliveIndex(
        state.combatState.initiativeOrder,
        state.combatState.currentTurnIndex,
        -1,
      )
      state.combatState.currentTurnIndex = index
      if (newRound) state.combatState.round = Math.max(1, state.combatState.round - 1)
    },
    updateCombatEntry(state, action: PayloadAction<{ entryId: string; updates: Partial<InitiativeEntry> }>) {
      if (!state.combatState) return
      const entry = state.combatState.initiativeOrder.find(e => e.id === action.payload.entryId)
      if (entry) Object.assign(entry, action.payload.updates)
    },
    addCombatEntry(state, action: PayloadAction<{ entry: InitiativeEntry }>) {
      if (!state.combatState) return
      const sorted = sortInitiativeOrder([...state.combatState.initiativeOrder, action.payload.entry])
      state.combatState.initiativeOrder = sorted
    },
    removeCombatEntry(state, action: PayloadAction<{ entryId: string }>) {
      if (!state.combatState) return
      const filtered = state.combatState.initiativeOrder.filter(e => e.id !== action.payload.entryId)
      state.combatState.initiativeOrder = filtered
      state.combatState.currentTurnIndex = Math.min(
        state.combatState.currentTurnIndex,
        Math.max(0, filtered.length - 1),
      )
    },
  },
})

export const combatActions = combatSlice.actions
export const combatReducer = combatSlice.reducer
export type { CombatSliceState }
