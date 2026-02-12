import type { Campaign, Adventure, Session, Encounter, CardType, NPC, CampaignObject } from '~/types/encounter'
import { CARD_TYPE_INFO, NPC_ALIGNMENT_INFO, CAMPAIGN_OBJECT_TYPES } from '~/types/encounter'

// Caminho para um encontro na hierarquia
export type EncounterPath = {
  adventureId: string
  sessionId: string
  encounterId: string
  encounterName: string
}

// Coleta encontros com path completo
function collectWithPath(
  adventures: Adventure[],
  filterAdventureId?: string,
  filterSessionId?: string,
): { encounter: Encounter; path: EncounterPath }[] {
  const results: { encounter: Encounter; path: EncounterPath }[] = []
  for (const adv of adventures) {
    if (filterAdventureId && adv.id !== filterAdventureId) continue
    for (const sess of adv.sessions) {
      if (filterSessionId && sess.id !== filterSessionId) continue
      for (const enc of sess.encounters) {
        results.push({
          encounter: enc,
          path: {
            adventureId: adv.id,
            sessionId: sess.id,
            encounterId: enc.id,
            encounterName: enc.name,
          },
        })
      }
    }
  }
  return results
}

export function collectFromCampaign(campaign: Campaign) {
  return collectWithPath(campaign.adventures)
}

export function collectFromAdventure(campaign: Campaign, adventureId: string) {
  return collectWithPath(campaign.adventures, adventureId)
}

export function collectFromSession(campaign: Campaign, adventureId: string, sessionId: string) {
  return collectWithPath(campaign.adventures, adventureId, sessionId)
}

// Inimigo agrupado por tipo de criatura
export type GroupedEnemy = {
  creatureId: string
  name: string
  nd: number
  type: string
  count: number
  paths: EncounterPath[] // encontros onde aparece
}

// Carta agrupada (agora no nível da aventura)
export type GroupedCard = {
  card: { id: string; name: string }
  adventureName: string
}

// Seção de cartas por tipo
export type CardSection = {
  type: CardType
  icon: string
  label: string
  cards: GroupedCard[]
}

// NPC agrupado
export type GroupedNPC = {
  npcId: string
  name: string
  title?: string
  alignment: string
  isCombatant: boolean
  count: number
  paths: EncounterPath[]
}

// Objeto agrupado
export type GroupedObject = {
  objectId: string
  name: string
  type: string
  typeIcon: string
  totalQuantity: number
  paths: EncounterPath[]
}

// Resumo de recompensas
export type AggregatedRewards = {
  totalXP: number
  totalGold: number
  items: { name: string; path: EncounterPath }[]
}

export type AggregatedData = {
  enemies: GroupedEnemy[]
  cardSections: CardSection[]
  npcs: GroupedNPC[]
  objects: GroupedObject[]
  rewards: AggregatedRewards
  encounterCount: number
  totalEnemies: number
  totalCards: number
}

export function aggregateEncounters(
  items: { encounter: Encounter; path: EncounterPath }[],
  campaign?: Campaign,
  adventures?: Adventure[],
): AggregatedData {
  // Agrupar inimigos por creatureId
  const enemyMap = new Map<string, GroupedEnemy>()
  let totalEnemies = 0
  for (const { encounter, path } of items) {
    for (const enemy of encounter.enemies ?? []) {
      totalEnemies++
      const existing = enemyMap.get(enemy.creatureId)
      if (existing) {
        existing.count++
        if (!existing.paths.find(p => p.encounterId === path.encounterId)) {
          existing.paths.push(path)
        }
      } else {
        enemyMap.set(enemy.creatureId, {
          creatureId: enemy.creatureId,
          name: enemy.creature.name,
          nd: enemy.creature.nd,
          type: enemy.creature.type,
          count: 1,
          paths: [path],
        })
      }
    }
  }

  // Agrupar cartas por tipo (agora das aventuras)
  const cardsByType = new Map<CardType, GroupedCard[]>()
  let totalCards = 0
  for (const adv of adventures ?? []) {
    for (const card of adv.drawnCards ?? []) {
      totalCards++
      const list = cardsByType.get(card.type) ?? []
      list.push({ card: { id: card.id, name: card.name }, adventureName: adv.name })
      cardsByType.set(card.type, list)
    }
  }

  // Montar seções de cartas (só as que têm conteúdo)
  const cardSections: CardSection[] = []
  const typeOrder: CardType[] = ['character', 'object', 'threat', 'plot', 'location', 'event']
  for (const type of typeOrder) {
    const cards = cardsByType.get(type)
    if (cards && cards.length > 0) {
      const info = CARD_TYPE_INFO[type]
      cardSections.push({
        type,
        icon: info.icon,
        label: info.labelPt,
        cards,
      })
    }
  }

  // Agrupar NPCs por npcId
  const npcMap = new Map<string, GroupedNPC>()
  const campaignNpcs = campaign?.npcs ?? []
  for (const { encounter, path } of items) {
    for (const encNpc of encounter.encounterNpcs ?? []) {
      const existing = npcMap.get(encNpc.npcId)
      if (existing) {
        existing.count++
        if (!existing.paths.find(p => p.encounterId === path.encounterId)) {
          existing.paths.push(path)
        }
      } else {
        const npc = campaignNpcs.find((n: NPC) => n.id === encNpc.npcId)
        npcMap.set(encNpc.npcId, {
          npcId: encNpc.npcId,
          name: npc?.name ?? 'NPC desconhecido',
          title: npc?.title,
          alignment: npc ? NPC_ALIGNMENT_INFO[npc.alignment].label : 'Neutro',
          isCombatant: npc?.isCombatant ?? false,
          count: 1,
          paths: [path],
        })
      }
    }
  }

  // Agrupar Objetos por objectId
  const objectMap = new Map<string, GroupedObject>()
  const campaignObjects = campaign?.objects ?? []
  for (const { encounter, path } of items) {
    for (const encObj of encounter.encounterObjects ?? []) {
      const existing = objectMap.get(encObj.objectId)
      if (existing) {
        existing.totalQuantity += encObj.quantity
        if (!existing.paths.find(p => p.encounterId === path.encounterId)) {
          existing.paths.push(path)
        }
      } else {
        const obj = campaignObjects.find((o: CampaignObject) => o.id === encObj.objectId)
        const typeInfo = CAMPAIGN_OBJECT_TYPES.find(t => t.id === obj?.type)
        objectMap.set(encObj.objectId, {
          objectId: encObj.objectId,
          name: obj?.name ?? 'Objeto desconhecido',
          type: typeInfo?.label ?? 'Outro',
          typeIcon: typeInfo?.icon ?? '📦',
          totalQuantity: encObj.quantity,
          paths: [path],
        })
      }
    }
  }

  // Agregar recompensas
  let totalXP = 0
  let totalGold = 0
  const rewardItems: { name: string; path: EncounterPath }[] = []
  for (const { encounter, path } of items) {
    for (const reward of encounter.rewards ?? []) {
      if (reward.type === 'xp' && reward.value) totalXP += reward.value
      if (reward.type === 'gold' && reward.value) totalGold += reward.value
      if (reward.type === 'item') {
        rewardItems.push({ name: reward.name, path })
      }
    }
  }

  return {
    enemies: Array.from(enemyMap.values()).sort((a, b) => a.nd - b.nd),
    cardSections,
    npcs: Array.from(npcMap.values()),
    objects: Array.from(objectMap.values()),
    rewards: { totalXP, totalGold, items: rewardItems },
    encounterCount: items.length,
    totalEnemies,
    totalCards,
  }
}
