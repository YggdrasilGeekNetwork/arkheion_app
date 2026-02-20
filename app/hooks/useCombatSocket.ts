import { useEffect, useRef } from 'react'
import { useSocketContext } from '~/contexts/SocketContext'
import { useMesa } from '~/contexts/MesaContext'
import type { InitiativeRollPayload, CombatAvailableActions } from '~/types/combat'

export function useCombatSocket() {
  const { socket } = useSocketContext()
  const { state, dispatch } = useMesa()

  // Use ref to avoid stale closure in socket listener
  const combatStateRef = useRef(state.combatState)
  combatStateRef.current = state.combatState

  // Listen for incoming socket events from players
  useEffect(() => {
    if (!socket) return

    function handleInitiativeRoll(payload: InitiativeRollPayload) {
      const cs = combatStateRef.current
      if (!cs) return
      const entry = cs.initiativeOrder.find(
        e => e.type === 'player' && e.sourceId === payload.characterId
      )
      if (entry) {
        dispatch({
          type: 'SET_INITIATIVE',
          payload: { entryId: entry.id, initiative: payload.initiative },
        })
      }
    }

    function handleTurnEnd() {
      const cs = combatStateRef.current
      if (!cs || cs.status !== 'in_progress') return
      dispatch({ type: 'NEXT_TURN' })
    }

    function handleSyncRequest(payload: { mesaId: string }) {
      const cs = combatStateRef.current
      if (!socket || !cs || !state.mesa || state.mesa.id !== payload.mesaId) return
      if (cs.status === 'in_progress') {
        const currentEntry = cs.initiativeOrder[cs.currentTurnIndex]
        if (currentEntry) {
          socket.emit('turn:change', { mesaId: state.mesa.id, currentEntry, round: cs.round })
        }
      } else if (cs.status === 'rolling_initiative') {
        socket.emit('initiative:request', { mesaId: state.mesa.id })
      }
    }

    function handleActionUpdate(payload: { characterId: string; availableActions: CombatAvailableActions }) {
      const cs = combatStateRef.current
      if (!cs) return
      const entry = cs.initiativeOrder.find(e => e.type === 'player' && e.sourceId === payload.characterId)
      if (entry) {
        dispatch({
          type: 'UPDATE_COMBAT_ENTRY',
          payload: { entryId: entry.id, updates: { availableActions: payload.availableActions } },
        })
      }
    }

    function handleHealthUpdate(payload: { characterId: string; health: number }) {
      const cs = combatStateRef.current
      if (!cs) return
      const entry = cs.initiativeOrder.find(e => e.type === 'player' && e.sourceId === payload.characterId)
      if (entry) {
        dispatch({
          type: 'UPDATE_COMBAT_ENTRY',
          payload: { entryId: entry.id, updates: { currentPv: payload.health } },
        })
      }
    }

    socket.on('initiative:roll', handleInitiativeRoll)
    socket.on('turn:end', handleTurnEnd)
    socket.on('combat:sync:request', handleSyncRequest)
    socket.on('character:action:update', handleActionUpdate)
    socket.on('character:health:update', handleHealthUpdate)

    return () => {
      socket.off('initiative:roll', handleInitiativeRoll)
      socket.off('turn:end', handleTurnEnd)
      socket.off('combat:sync:request', handleSyncRequest)
      socket.off('character:action:update', handleActionUpdate)
      socket.off('character:health:update', handleHealthUpdate)
    }
  }, [socket, dispatch])

  // Automatically emit turn:change to players whenever the DM's current turn changes
  useEffect(() => {
    if (!socket || !state.combatState || !state.mesa) return
    if (state.combatState.status !== 'in_progress') return
    const currentEntry = state.combatState.initiativeOrder[state.combatState.currentTurnIndex]
    if (!currentEntry) return
    socket.emit('turn:change', {
      mesaId: state.mesa.id,
      currentEntry,
      round: state.combatState.round,
    })
  }, [
    socket,
    state.combatState?.currentTurnIndex,
    state.combatState?.round,
    state.combatState?.status,
    state.mesa?.id,
  ])

  function emitCombatEnd() {
    if (!socket || !state.mesa || !state.combatState) return
    socket.emit('combat:end', {
      mesaId: state.mesa.id,
      encounterId: state.combatState.encounterId,
    })
  }

  return { emitCombatEnd }
}
