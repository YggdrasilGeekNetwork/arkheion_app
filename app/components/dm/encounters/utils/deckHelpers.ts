import type { Card, CardType, DrawnCard } from '~/types/encounter'
import { ADVENTURE_DECK } from '~/data/adventureDeck'

/**
 * Método Nimb: compra uma carta aleatória do tipo escolhido.
 */
export function drawRandomCard(type: CardType, excludeIds: string[] = []): Card | null {
  const cards = ADVENTURE_DECK[type]?.filter(c => !excludeIds.includes(c.id))
  if (!cards || cards.length === 0) return null
  const index = Math.floor(Math.random() * cards.length)
  return cards[index]
}

/**
 * Método Khalmyr: retorna 3 cartas aleatórias do tipo escolhido para o jogador escolher.
 */
export function drawKhalmyrOptions(type: CardType, count: number = 3, excludeIds: string[] = []): Card[] {
  const cards = ADVENTURE_DECK[type]?.filter(c => !excludeIds.includes(c.id))
  if (!cards || cards.length === 0) return []

  const shuffled = [...cards].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Cria uma DrawnCard a partir de uma Card.
 */
export function createDrawnCard(card: Card, method: 'nimb' | 'khalmyr'): DrawnCard {
  return {
    ...card,
    drawnAt: new Date().toISOString(),
    method,
  }
}

/**
 * Compra aleatória para ameaças filtradas por tier.
 */
export function drawRandomThreat(tier: number, excludeIds: string[] = []): Card | null {
  const threats = ADVENTURE_DECK.threat?.filter(c => c.tier === tier && !excludeIds.includes(c.id))
  if (!threats || threats.length === 0) return null
  const index = Math.floor(Math.random() * threats.length)
  return threats[index]
}

/**
 * Khalmyr para ameaças filtradas por tier.
 */
export function drawKhalmyrThreats(tier: number, count: number = 3, excludeIds: string[] = []): Card[] {
  const threats = ADVENTURE_DECK.threat?.filter(c => c.tier === tier && !excludeIds.includes(c.id))
  if (!threats || threats.length === 0) return []

  const shuffled = [...threats].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Cria uma carta customizada.
 */
export function createCustomCard(type: CardType, name: string, description: string): Card {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    name,
    description,
  }
}
