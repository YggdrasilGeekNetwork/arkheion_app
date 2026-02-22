import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../index'

const COMBAT_STATE_KEY = 'arkheion:combatState'

export const combatPersistenceMiddleware: Middleware<object, RootState> = store => next => action => {
  const result = next(action)

  // Sync combat state to sessionStorage after any combat-related action
  if (typeof action === 'object' && action !== null && 'type' in action) {
    const type = (action as { type: string }).type
    if (type.startsWith('combat/')) {
      try {
        const state = store.getState()
        if (state.combat.combatState) {
          sessionStorage.setItem(COMBAT_STATE_KEY, JSON.stringify(state.combat.combatState))
        } else {
          sessionStorage.removeItem(COMBAT_STATE_KEY)
        }
      } catch {
        // sessionStorage unavailable (SSR or private mode)
      }
    }
  }

  return result
}
