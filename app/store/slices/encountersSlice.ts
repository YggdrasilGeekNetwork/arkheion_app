import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  Campaign, Adventure, Session, Encounter, DrawnCard, EncounterEnemy,
  NPC, NPCVersion, EncounterNPC, CampaignObject, EncounterObject, Reward,
} from '~/types/encounter'
import { initialState as mesaInitialState } from '~/reducers/mesaReducer'

type EncountersState = {
  campaigns: Campaign[]
  activeCampaignId: string | null
  activeAdventureId: string | null
  activeSessionId: string | null
  activeEncounterId: string | null
}

const initialState: EncountersState = {
  campaigns: mesaInitialState.campaigns,
  activeCampaignId: mesaInitialState.activeCampaignId,
  activeAdventureId: mesaInitialState.activeAdventureId,
  activeSessionId: mesaInitialState.activeSessionId,
  activeEncounterId: mesaInitialState.activeEncounterId,
}

// ---- Immer-compatible traversal helpers ----

function getActiveCampaign(state: EncountersState): Campaign | undefined {
  return state.campaigns.find(c => c.id === state.activeCampaignId)
}

function getActiveAdventure(state: EncountersState): Adventure | undefined {
  return getActiveCampaign(state)?.adventures.find(a => a.id === state.activeAdventureId)
}

function getActiveSession(state: EncountersState): Session | undefined {
  return getActiveAdventure(state)?.sessions.find(s => s.id === state.activeSessionId)
}

function getActiveEncounterDraft(state: EncountersState): Encounter | undefined {
  return getActiveSession(state)?.encounters.find(e => e.id === state.activeEncounterId)
}

// Re-exported for external consumers (components that compute UI from MesaState)
export function getActiveEncounterFromState(state: EncountersState): Encounter | undefined {
  return getActiveEncounterDraft(state)
}

const encountersSlice = createSlice({
  name: 'encounters',
  initialState,
  reducers: {
    // ---- Campaigns ----
    createCampaign(state, action: PayloadAction<{ name: string; description?: string }>) {
      const now = new Date().toISOString()
      const campaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        adventures: [],
        npcs: [],
        objects: [],
        createdAt: now,
        updatedAt: now,
      }
      state.campaigns.push(campaign)
      state.activeCampaignId = campaign.id
    },
    deleteCampaign(state, action: PayloadAction<string>) {
      state.campaigns = state.campaigns.filter(c => c.id !== action.payload)
      if (state.activeCampaignId === action.payload) {
        state.activeCampaignId = null
        state.activeAdventureId = null
        state.activeSessionId = null
        state.activeEncounterId = null
      }
    },
    setActiveCampaign(state, action: PayloadAction<string | null>) {
      state.activeCampaignId = action.payload
      state.activeAdventureId = null
      state.activeSessionId = null
      state.activeEncounterId = null
    },

    // ---- Adventures ----
    createAdventure(state, action: PayloadAction<{ name: string; description?: string }>) {
      const now = new Date().toISOString()
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      const adventure: Adventure = {
        id: `adv-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        drawnCards: [],
        sessions: [],
        createdAt: now,
        updatedAt: now,
      }
      campaign.adventures.push(adventure)
      campaign.updatedAt = now
      state.activeAdventureId = adventure.id
    },
    deleteAdventure(state, action: PayloadAction<string>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      campaign.adventures = campaign.adventures.filter(a => a.id !== action.payload)
      if (state.activeAdventureId === action.payload) {
        state.activeAdventureId = null
        state.activeSessionId = null
        state.activeEncounterId = null
      }
    },
    setActiveAdventure(state, action: PayloadAction<string | null>) {
      state.activeAdventureId = action.payload
      state.activeSessionId = null
      state.activeEncounterId = null
    },

    // ---- Sessions ----
    createSession(state, action: PayloadAction<{ name: string; number: number; date?: string }>) {
      const now = new Date().toISOString()
      const adventure = getActiveAdventure(state)
      if (!adventure) return
      const session: Session = {
        id: `sess-${Date.now()}`,
        name: action.payload.name,
        number: action.payload.number,
        date: action.payload.date,
        encounters: [],
        createdAt: now,
        updatedAt: now,
      }
      adventure.sessions.push(session)
      adventure.updatedAt = now
      state.activeSessionId = session.id
    },
    deleteSession(state, action: PayloadAction<string>) {
      const adventure = getActiveAdventure(state)
      if (!adventure) return
      adventure.sessions = adventure.sessions.filter(s => s.id !== action.payload)
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = null
        state.activeEncounterId = null
      }
    },
    setActiveSession(state, action: PayloadAction<string | null>) {
      state.activeSessionId = action.payload
      state.activeEncounterId = null
    },

    // ---- Encounters ----
    createEncounter(state, action: PayloadAction<{ name: string; description?: string }>) {
      const now = new Date().toISOString()
      const session = getActiveSession(state)
      if (!session) return
      const encounter: Encounter = {
        id: `enc-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        status: 'draft',
        enemies: [],
        encounterNpcs: [],
        encounterObjects: [],
        rewards: [],
        createdAt: now,
        updatedAt: now,
      }
      session.encounters.push(encounter)
      session.updatedAt = now
      state.activeEncounterId = encounter.id
    },
    deleteEncounter(state, action: PayloadAction<string>) {
      const session = getActiveSession(state)
      if (!session) return
      session.encounters = session.encounters.filter(e => e.id !== action.payload)
      if (state.activeEncounterId === action.payload) state.activeEncounterId = null
    },
    setActiveEncounter(state, action: PayloadAction<string | null>) {
      state.activeEncounterId = action.payload
    },
    updateEncounter(state, action: PayloadAction<{ id: string; data: Partial<Encounter> }>) {
      const enc = getActiveEncounterDraft(state)
      if (enc && enc.id === action.payload.id) {
        Object.assign(enc, action.payload.data)
        enc.updatedAt = new Date().toISOString()
      }
    },
    navigateBack(state) {
      if (state.activeEncounterId) { state.activeEncounterId = null; return }
      if (state.activeSessionId) { state.activeSessionId = null; return }
      if (state.activeAdventureId) { state.activeAdventureId = null; return }
      if (state.activeCampaignId) { state.activeCampaignId = null; return }
    },
    navigateToEncounter(state, action: PayloadAction<{ adventureId: string; sessionId: string; encounterId: string }>) {
      state.activeAdventureId = action.payload.adventureId
      state.activeSessionId = action.payload.sessionId
      state.activeEncounterId = action.payload.encounterId
    },

    // ---- Adventure Cards ----
    addCardToAdventure(state, action: PayloadAction<{ card: DrawnCard }>) {
      const adventure = getActiveAdventure(state)
      if (!adventure) return
      adventure.drawnCards = adventure.drawnCards ?? []
      adventure.drawnCards.push(action.payload.card)
      adventure.updatedAt = new Date().toISOString()
    },
    removeCardFromAdventure(state, action: PayloadAction<{ cardIndex: number }>) {
      const adventure = getActiveAdventure(state)
      if (!adventure) return
      adventure.drawnCards = (adventure.drawnCards ?? []).filter((_, i) => i !== action.payload.cardIndex)
      adventure.updatedAt = new Date().toISOString()
    },
    clearAdventureCards(state) {
      const adventure = getActiveAdventure(state)
      if (!adventure) return
      adventure.drawnCards = []
      adventure.updatedAt = new Date().toISOString()
    },

    // ---- Enemies ----
    addEnemyToEncounter(state, action: PayloadAction<{ enemy: EncounterEnemy }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      enc.enemies = enc.enemies ?? []
      enc.enemies.push(action.payload.enemy)
      enc.updatedAt = new Date().toISOString()
    },
    removeEnemyFromEncounter(state, action: PayloadAction<{ enemyId: string }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      enc.enemies = (enc.enemies ?? []).filter(e => e.id !== action.payload.enemyId)
      enc.updatedAt = new Date().toISOString()
    },
    updateEnemyInEncounter(state, action: PayloadAction<{ enemyId: string; updates: Partial<EncounterEnemy> }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      const enemy = (enc.enemies ?? []).find(e => e.id === action.payload.enemyId)
      if (enemy) Object.assign(enemy, action.payload.updates)
      enc.updatedAt = new Date().toISOString()
    },

    // ---- Campaign NPCs ----
    createNpc(state, action: PayloadAction<{ npc: NPC }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      campaign.npcs = campaign.npcs ?? []
      campaign.npcs.push(action.payload.npc)
      campaign.updatedAt = new Date().toISOString()
    },
    updateNpc(state, action: PayloadAction<{ npcId: string; updates: Partial<NPC> }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      const npc = (campaign.npcs ?? []).find(n => n.id === action.payload.npcId)
      if (npc) {
        Object.assign(npc, action.payload.updates)
        npc.updatedAt = new Date().toISOString()
      }
      campaign.updatedAt = new Date().toISOString()
    },
    deleteNpc(state, action: PayloadAction<{ npcId: string }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      campaign.npcs = (campaign.npcs ?? []).filter(n => n.id !== action.payload.npcId)
      campaign.updatedAt = new Date().toISOString()
    },
    addNpcVersion(state, action: PayloadAction<{ npcId: string; version: NPCVersion }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      const npc = (campaign.npcs ?? []).find(n => n.id === action.payload.npcId)
      if (npc) {
        npc.versions.push(action.payload.version)
        npc.updatedAt = new Date().toISOString()
      }
      campaign.updatedAt = new Date().toISOString()
    },
    updateNpcVersion(state, action: PayloadAction<{ npcId: string; versionId: string; updates: Partial<NPCVersion> }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      const npc = (campaign.npcs ?? []).find(n => n.id === action.payload.npcId)
      if (npc) {
        const version = npc.versions.find(v => v.id === action.payload.versionId)
        if (version) Object.assign(version, action.payload.updates)
        npc.updatedAt = new Date().toISOString()
      }
      campaign.updatedAt = new Date().toISOString()
    },
    deleteNpcVersion(state, action: PayloadAction<{ npcId: string; versionId: string }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      const npc = (campaign.npcs ?? []).find(n => n.id === action.payload.npcId)
      if (npc) {
        npc.versions = npc.versions.filter(v => v.id !== action.payload.versionId)
        npc.updatedAt = new Date().toISOString()
      }
      campaign.updatedAt = new Date().toISOString()
    },

    // ---- Encounter NPCs ----
    addNpcToEncounter(state, action: PayloadAction<{ encounterNpc: EncounterNPC }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      enc.encounterNpcs = enc.encounterNpcs ?? []
      enc.encounterNpcs.push(action.payload.encounterNpc)
      enc.updatedAt = new Date().toISOString()
    },
    removeNpcFromEncounter(state, action: PayloadAction<{ encounterNpcId: string }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      enc.encounterNpcs = (enc.encounterNpcs ?? []).filter(n => n.id !== action.payload.encounterNpcId)
      enc.updatedAt = new Date().toISOString()
    },
    updateNpcInEncounter(state, action: PayloadAction<{ encounterNpcId: string; updates: Partial<EncounterNPC> }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      const npc = (enc.encounterNpcs ?? []).find(n => n.id === action.payload.encounterNpcId)
      if (npc) Object.assign(npc, action.payload.updates)
      enc.updatedAt = new Date().toISOString()
    },

    // ---- Campaign Objects ----
    createObject(state, action: PayloadAction<{ object: CampaignObject }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      campaign.objects = campaign.objects ?? []
      campaign.objects.push(action.payload.object)
      campaign.updatedAt = new Date().toISOString()
    },
    updateObject(state, action: PayloadAction<{ objectId: string; updates: Partial<CampaignObject> }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      const obj = (campaign.objects ?? []).find(o => o.id === action.payload.objectId)
      if (obj) {
        Object.assign(obj, action.payload.updates)
        obj.updatedAt = new Date().toISOString()
      }
      campaign.updatedAt = new Date().toISOString()
    },
    deleteObject(state, action: PayloadAction<{ objectId: string }>) {
      const campaign = getActiveCampaign(state)
      if (!campaign) return
      campaign.objects = (campaign.objects ?? []).filter(o => o.id !== action.payload.objectId)
      campaign.updatedAt = new Date().toISOString()
    },

    // ---- Encounter Objects ----
    addObjectToEncounter(state, action: PayloadAction<{ encounterObject: EncounterObject }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      enc.encounterObjects = enc.encounterObjects ?? []
      enc.encounterObjects.push(action.payload.encounterObject)
      enc.updatedAt = new Date().toISOString()
    },
    removeObjectFromEncounter(state, action: PayloadAction<{ encounterObjectId: string }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      enc.encounterObjects = (enc.encounterObjects ?? []).filter(
        o => o.id !== action.payload.encounterObjectId
      )
      enc.updatedAt = new Date().toISOString()
    },
    updateObjectInEncounter(state, action: PayloadAction<{ encounterObjectId: string; updates: Partial<EncounterObject> }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      const obj = (enc.encounterObjects ?? []).find(o => o.id === action.payload.encounterObjectId)
      if (obj) Object.assign(obj, action.payload.updates)
      enc.updatedAt = new Date().toISOString()
    },

    // ---- Rewards ----
    addReward(state, action: PayloadAction<{ reward: Reward }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      enc.rewards = enc.rewards ?? []
      enc.rewards.push(action.payload.reward)
      enc.updatedAt = new Date().toISOString()
    },
    updateReward(state, action: PayloadAction<{ rewardId: string; updates: Partial<Reward> }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      const reward = (enc.rewards ?? []).find(r => r.id === action.payload.rewardId)
      if (reward) Object.assign(reward, action.payload.updates)
      enc.updatedAt = new Date().toISOString()
    },
    removeReward(state, action: PayloadAction<{ rewardId: string }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      enc.rewards = (enc.rewards ?? []).filter(r => r.id !== action.payload.rewardId)
      enc.updatedAt = new Date().toISOString()
    },
    toggleRewardDistributed(state, action: PayloadAction<{ rewardId: string }>) {
      const enc = getActiveEncounterDraft(state)
      if (!enc) return
      const reward = (enc.rewards ?? []).find(r => r.id === action.payload.rewardId)
      if (reward) reward.distributed = !reward.distributed
      enc.updatedAt = new Date().toISOString()
    },
  },
})

export const encountersActions = encountersSlice.actions
export const encountersReducer = encountersSlice.reducer
export type { EncountersState }
