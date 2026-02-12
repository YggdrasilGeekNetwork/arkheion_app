import type { EncounterEnemy, EncounterNPC, Campaign, NPC } from '~/types/encounter'

// Tabela de XP base por ND (Tormenta 20)
export const XP_BY_ND: Record<number, number> = {
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
}

export function getXPForND(nd: number): number {
  return XP_BY_ND[nd] ?? 0
}

export type XPBreakdownItem = {
  name: string
  nd: number
  count: number
  xp: number
}

export function calculateEncounterXP(
  enemies: EncounterEnemy[],
  encounterNpcs: EncounterNPC[],
  campaign: Campaign,
): { total: number; breakdown: XPBreakdownItem[] } {
  const breakdown: XPBreakdownItem[] = []

  // Agrupar inimigos por creatureId
  const enemyGroups = new Map<string, { name: string; nd: number; count: number }>()
  for (const enemy of enemies) {
    const existing = enemyGroups.get(enemy.creatureId)
    if (existing) {
      existing.count++
    } else {
      enemyGroups.set(enemy.creatureId, {
        name: enemy.creature.name,
        nd: enemy.creature.nd,
        count: 1,
      })
    }
  }
  for (const group of enemyGroups.values()) {
    breakdown.push({
      name: group.name,
      nd: group.nd,
      count: group.count,
      xp: getXPForND(group.nd) * group.count,
    })
  }

  // NPCs combatentes inimigos
  for (const encNpc of encounterNpcs) {
    const npc = campaign.npcs.find((n: NPC) => n.id === encNpc.npcId)
    if (!npc || !npc.isCombatant || npc.alignment !== 'enemy') continue
    const version = npc.versions.find(v => v.id === encNpc.versionId)
    if (!version?.creature) continue
    breakdown.push({
      name: npc.name,
      nd: version.creature.nd,
      count: 1,
      xp: getXPForND(version.creature.nd),
    })
  }

  const total = breakdown.reduce((sum, item) => sum + item.xp, 0)
  return { total, breakdown }
}
