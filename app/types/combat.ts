export type CombatStatus = 'rolling_initiative' | 'in_progress' | 'ended'

export type InitiativeEntryType = 'player' | 'enemy' | 'npc'

export type CombatAvailableActions = {
  standard: number
  movement: number
  free: number
}

export type InitiativeEntry = {
  id: string
  name: string
  type: InitiativeEntryType
  initiative: number | null
  sourceId: string
  currentPv?: number
  maxPv?: number
  currentPm?: number
  maxPm?: number
  ca?: number
  isDefeated: boolean
  conditions?: string[]
  availableActions?: CombatAvailableActions
  // Stored at combat start for enemy/npc entries so lookup isn't needed at render time
  creature?: import('~/types/encounter').Creature
}

export type CombatState = {
  encounterId: string
  status: CombatStatus
  round: number
  currentTurnIndex: number
  initiativeOrder: InitiativeEntry[]
}

// Socket.io event payloads
export type CombatStartPayload = {
  mesaId: string
  encounterId: string
}

export type InitiativeRequestPayload = {
  mesaId: string
  encounterId: string
}

export type InitiativeRollPayload = {
  mesaId: string
  characterId: string
  characterName: string
  initiative: number
}

export type TurnChangePayload = {
  mesaId: string
  currentEntry: InitiativeEntry
  round: number
}

export type CombatEndPayload = {
  mesaId: string
  encounterId: string
}
