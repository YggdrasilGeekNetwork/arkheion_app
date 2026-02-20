import { useState, useEffect, useCallback } from 'react'
import { useSocketContext } from '~/contexts/SocketContext'
import type { TurnChangePayload } from '~/types/combat'

export function usePlayerCombatSocket(characterId: string, mesaId: string) {
  const { socket } = useSocketContext()
  const [combatActive, setCombatActive] = useState(false)
  const [initiativeRequested, setInitiativeRequested] = useState(false)
  const [initiativeRolledForDM, setInitiativeRolledForDM] = useState(false)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [currentTurnName, setCurrentTurnName] = useState<string | null>(null)
  const [round, setRound] = useState(1)
  const [dmConditions, setDmConditions] = useState<string[]>([])
  const [dmInitiative, setDmInitiative] = useState<number | null>(null)

  useEffect(() => {
    if (!socket) return

    function onCombatStart() {
      setCombatActive(true)
    }

    function onInitiativeRequest() {
      setInitiativeRequested(true)
      setInitiativeRolledForDM(false)
    }

    function onTurnChange(payload: TurnChangePayload) {
      setCombatActive(true)
      setIsMyTurn(payload.currentEntry.sourceId === characterId)
      setCurrentTurnName(payload.currentEntry.name)
      setRound(payload.round)
    }

    function onCombatEnd() {
      setCombatActive(false)
      setInitiativeRequested(false)
      setInitiativeRolledForDM(false)
      setIsMyTurn(false)
      setCurrentTurnName(null)
      setDmConditions([])
    }

    function onConditionsUpdate(payload: { characterId: string; conditions: string[] }) {
      if (payload.characterId !== characterId) return
      setDmConditions(payload.conditions)
    }

    function onInitiativeUpdate(payload: { characterId: string; initiative: number }) {
      if (payload.characterId !== characterId) return
      setDmInitiative(payload.initiative)
    }

    socket.on('combat:start', onCombatStart)
    socket.on('initiative:request', onInitiativeRequest)
    socket.on('turn:change', onTurnChange)
    socket.on('combat:end', onCombatEnd)
    socket.on('character:conditions:update', onConditionsUpdate)
    socket.on('character:initiative:update', onInitiativeUpdate)

    // Request current combat state in case we joined mid-combat
    function requestSync() {
      if (mesaId && socket) socket.emit('combat:sync:request', { mesaId })
    }
    if (socket.connected) {
      requestSync()
    } else {
      socket.on('connect', requestSync)
    }

    return () => {
      socket.off('combat:start', onCombatStart)
      socket.off('initiative:request', onInitiativeRequest)
      socket.off('turn:change', onTurnChange)
      socket.off('combat:end', onCombatEnd)
      socket.off('character:conditions:update', onConditionsUpdate)
      socket.off('character:initiative:update', onInitiativeUpdate)
      socket.off('connect', requestSync)
    }
  }, [socket, characterId, mesaId])

  const sendInitiativeRoll = useCallback((initiative: number, characterName: string, mesaIdArg: string) => {
    if (!socket) return
    socket.emit('initiative:roll', {
      mesaId: mesaIdArg,
      characterId,
      characterName,
      initiative,
    })
    setInitiativeRequested(false)
    setInitiativeRolledForDM(true)
  }, [socket, characterId])

  const sendTurnEnd = useCallback((mesaIdArg: string) => {
    if (!socket) return
    socket.emit('turn:end', {
      mesaId: mesaIdArg,
      characterId,
    })
    setIsMyTurn(false)
  }, [socket, characterId])

  return {
    combatActive,
    initiativeRequested,
    initiativeRolledForDM,
    isMyTurn,
    currentTurnName,
    round,
    dmConditions,
    dmInitiative,
    sendInitiativeRoll,
    sendTurnEnd,
  }
}
