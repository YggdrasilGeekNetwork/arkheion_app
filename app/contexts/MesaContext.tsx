import { createContext, useContext, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { useAppDispatch } from '~/store/hooks'
import type { RootState } from '~/store'
import { uiActions } from '~/store/slices/uiSlice'
import { combatActions } from '~/store/slices/combatSlice'
import { soundboardActions } from '~/store/slices/soundboardSlice'
import { mesaActions } from '~/store/slices/mesaSlice'
import { encountersActions } from '~/store/slices/encountersSlice'
import { notesActions } from '~/store/slices/notesSlice'
import type { MesaAction, MesaState } from '~/reducers/mesaReducer'

const COMBAT_STATE_KEY = 'arkheion:combatState'

type MesaContextType = {
  state: MesaState
  dispatch: (action: MesaAction) => void
}

const MesaContext = createContext<MesaContextType | null>(null)

export function MesaProvider({ children }: { children: ReactNode }) {
  const appDispatch = useAppDispatch()
  const restoredRef = useRef(false)

  // Assemble MesaState from multiple Redux slices
  const state = useSelector((s: RootState) => ({
    mesa: s.mesa.mesa,
    isLoading: s.mesa.isLoading,
    error: s.mesa.error,
    snapshotFields: s.ui.snapshotFields,
    campaigns: s.encounters.campaigns,
    activeCampaignId: s.encounters.activeCampaignId,
    activeAdventureId: s.encounters.activeAdventureId,
    activeSessionId: s.encounters.activeSessionId,
    activeEncounterId: s.encounters.activeEncounterId,
    combatState: s.combat.combatState,
    notes: s.notes.notes,
    noteFolders: s.notes.noteFolders,
    activeNoteId: s.notes.activeNoteId,
    activeFolderId: s.notes.activeFolderId,
    soundboard: s.soundboard,
  }), shallowEqual) as MesaState

  // Restore combat state from sessionStorage on mount
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    try {
      const saved = sessionStorage.getItem(COMBAT_STATE_KEY)
      if (saved) {
        const combatState = JSON.parse(saved)
        appDispatch(combatActions.restoreCombat(combatState))
      }
    } catch {
      // ignore parse errors
    }
  }, [appDispatch])

  // Route MesaAction to the appropriate Redux slice
  const dispatch = useCallback((action: MesaAction) => {
    switch (action.type) {
      // Mesa
      case 'SET_MESA': appDispatch(mesaActions.setMesa(action.payload)); break
      case 'CLEAR_MESA': appDispatch(mesaActions.clearMesa()); break
      case 'UPDATE_CHARACTER': appDispatch(mesaActions.updateCharacter(action.payload)); break
      case 'SET_LOADING': appDispatch(mesaActions.setLoading(action.payload)); break
      case 'SET_ERROR': appDispatch(mesaActions.setError(action.payload)); break
      // UI
      case 'SET_SNAPSHOT_FIELDS': appDispatch(uiActions.setSnapshotFields(action.payload)); break
      case 'TOGGLE_FIELD_VISIBILITY': appDispatch(uiActions.toggleFieldVisibility(action.payload)); break
      // Campaigns
      case 'CREATE_CAMPAIGN': appDispatch(encountersActions.createCampaign(action.payload)); break
      case 'DELETE_CAMPAIGN': appDispatch(encountersActions.deleteCampaign(action.payload)); break
      case 'SET_ACTIVE_CAMPAIGN': appDispatch(encountersActions.setActiveCampaign(action.payload)); break
      // Adventures
      case 'CREATE_ADVENTURE': appDispatch(encountersActions.createAdventure(action.payload)); break
      case 'DELETE_ADVENTURE': appDispatch(encountersActions.deleteAdventure(action.payload)); break
      case 'SET_ACTIVE_ADVENTURE': appDispatch(encountersActions.setActiveAdventure(action.payload)); break
      // Sessions
      case 'CREATE_SESSION': appDispatch(encountersActions.createSession(action.payload)); break
      case 'DELETE_SESSION': appDispatch(encountersActions.deleteSession(action.payload)); break
      case 'SET_ACTIVE_SESSION': appDispatch(encountersActions.setActiveSession(action.payload)); break
      // Encounters
      case 'CREATE_ENCOUNTER': appDispatch(encountersActions.createEncounter(action.payload)); break
      case 'DELETE_ENCOUNTER': appDispatch(encountersActions.deleteEncounter(action.payload)); break
      case 'SET_ACTIVE_ENCOUNTER': appDispatch(encountersActions.setActiveEncounter(action.payload)); break
      case 'UPDATE_ENCOUNTER': appDispatch(encountersActions.updateEncounter(action.payload)); break
      case 'NAVIGATE_BACK': appDispatch(encountersActions.navigateBack()); break
      case 'NAVIGATE_TO_ENCOUNTER': appDispatch(encountersActions.navigateToEncounter(action.payload)); break
      // Adventure Cards
      case 'ADD_CARD_TO_ADVENTURE': appDispatch(encountersActions.addCardToAdventure(action.payload)); break
      case 'REMOVE_CARD_FROM_ADVENTURE': appDispatch(encountersActions.removeCardFromAdventure(action.payload)); break
      case 'CLEAR_ADVENTURE_CARDS': appDispatch(encountersActions.clearAdventureCards()); break
      // Enemies
      case 'ADD_ENEMY_TO_ENCOUNTER': appDispatch(encountersActions.addEnemyToEncounter(action.payload)); break
      case 'REMOVE_ENEMY_FROM_ENCOUNTER': appDispatch(encountersActions.removeEnemyFromEncounter(action.payload)); break
      case 'UPDATE_ENEMY_IN_ENCOUNTER': appDispatch(encountersActions.updateEnemyInEncounter(action.payload)); break
      // Campaign NPCs
      case 'CREATE_NPC': appDispatch(encountersActions.createNpc(action.payload)); break
      case 'UPDATE_NPC': appDispatch(encountersActions.updateNpc(action.payload)); break
      case 'DELETE_NPC': appDispatch(encountersActions.deleteNpc(action.payload)); break
      case 'ADD_NPC_VERSION': appDispatch(encountersActions.addNpcVersion(action.payload)); break
      case 'UPDATE_NPC_VERSION': appDispatch(encountersActions.updateNpcVersion(action.payload)); break
      case 'DELETE_NPC_VERSION': appDispatch(encountersActions.deleteNpcVersion(action.payload)); break
      // Encounter NPCs
      case 'ADD_NPC_TO_ENCOUNTER': appDispatch(encountersActions.addNpcToEncounter(action.payload)); break
      case 'REMOVE_NPC_FROM_ENCOUNTER': appDispatch(encountersActions.removeNpcFromEncounter(action.payload)); break
      case 'UPDATE_NPC_IN_ENCOUNTER': appDispatch(encountersActions.updateNpcInEncounter(action.payload)); break
      // Campaign Objects
      case 'CREATE_OBJECT': appDispatch(encountersActions.createObject(action.payload)); break
      case 'UPDATE_OBJECT': appDispatch(encountersActions.updateObject(action.payload)); break
      case 'DELETE_OBJECT': appDispatch(encountersActions.deleteObject(action.payload)); break
      // Encounter Objects
      case 'ADD_OBJECT_TO_ENCOUNTER': appDispatch(encountersActions.addObjectToEncounter(action.payload)); break
      case 'REMOVE_OBJECT_FROM_ENCOUNTER': appDispatch(encountersActions.removeObjectFromEncounter(action.payload)); break
      case 'UPDATE_OBJECT_IN_ENCOUNTER': appDispatch(encountersActions.updateObjectInEncounter(action.payload)); break
      // Rewards
      case 'ADD_REWARD': appDispatch(encountersActions.addReward(action.payload)); break
      case 'UPDATE_REWARD': appDispatch(encountersActions.updateReward(action.payload)); break
      case 'REMOVE_REWARD': appDispatch(encountersActions.removeReward(action.payload)); break
      case 'TOGGLE_REWARD_DISTRIBUTED': appDispatch(encountersActions.toggleRewardDistributed(action.payload)); break
      // Notes
      case 'CREATE_NOTE': appDispatch(notesActions.createNote(action.payload)); break
      case 'UPDATE_NOTE': appDispatch(notesActions.updateNote(action.payload)); break
      case 'DELETE_NOTE': appDispatch(notesActions.deleteNote(action.payload)); break
      case 'SET_ACTIVE_NOTE': appDispatch(notesActions.setActiveNote(action.payload)); break
      case 'TOGGLE_NOTE_PIN': appDispatch(notesActions.toggleNotePin(action.payload)); break
      case 'MOVE_NOTE_TO_FOLDER': appDispatch(notesActions.moveNoteToFolder(action.payload)); break
      case 'ADD_NOTE_LINK': appDispatch(notesActions.addNoteLink(action.payload)); break
      case 'REMOVE_NOTE_LINK': appDispatch(notesActions.removeNoteLink(action.payload)); break
      case 'CREATE_NOTE_FOLDER': appDispatch(notesActions.createNoteFolder(action.payload)); break
      case 'RENAME_NOTE_FOLDER': appDispatch(notesActions.renameNoteFolder(action.payload)); break
      case 'DELETE_NOTE_FOLDER': appDispatch(notesActions.deleteNoteFolder(action.payload)); break
      case 'SET_ACTIVE_FOLDER': appDispatch(notesActions.setActiveFolder(action.payload)); break
      // Soundboard
      case 'ADD_SOUNDBOARD_SLOT': appDispatch(soundboardActions.addSlot(action.payload)); break
      case 'REMOVE_SOUNDBOARD_SLOT': appDispatch(soundboardActions.removeSlot(action.payload)); break
      case 'REORDER_SOUNDBOARD_SLOTS': appDispatch(soundboardActions.reorderSlots(action.payload)); break
      case 'UPDATE_SOUNDBOARD_SLOT': appDispatch(soundboardActions.updateSlot(action.payload)); break
      case 'ADD_CUSTOM_SOUND': appDispatch(soundboardActions.addCustomSound(action.payload)); break
      case 'REMOVE_CUSTOM_SOUND': appDispatch(soundboardActions.removeCustomSound(action.payload)); break
      case 'ADD_RECENT_MEDIA': appDispatch(soundboardActions.addRecentMedia(action.payload)); break
      case 'ADD_PLAYLIST_SLOT': appDispatch(soundboardActions.addPlaylistSlot(action.payload)); break
      case 'REMOVE_PLAYLIST_SLOT': appDispatch(soundboardActions.removePlaylistSlot(action.payload)); break
      case 'ADD_CUSTOM_PLAYLIST': appDispatch(soundboardActions.addCustomPlaylist(action.payload)); break
      case 'REMOVE_CUSTOM_PLAYLIST': appDispatch(soundboardActions.removeCustomPlaylist(action.payload)); break
      // Combat
      case 'START_COMBAT': appDispatch(combatActions.startCombat(action.payload)); break
      case 'END_COMBAT': appDispatch(combatActions.endCombat()); break
      case 'RESTORE_COMBAT': appDispatch(combatActions.restoreCombat(action.payload)); break
      case 'SET_INITIATIVE': appDispatch(combatActions.setInitiative(action.payload)); break
      case 'NEXT_TURN': appDispatch(combatActions.nextTurn()); break
      case 'PREVIOUS_TURN': appDispatch(combatActions.previousTurn()); break
      case 'UPDATE_COMBAT_ENTRY': appDispatch(combatActions.updateCombatEntry(action.payload)); break
      case 'ADD_COMBAT_ENTRY': appDispatch(combatActions.addCombatEntry(action.payload)); break
      case 'REMOVE_COMBAT_ENTRY': appDispatch(combatActions.removeCombatEntry(action.payload)); break
    }
  }, [appDispatch])

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
