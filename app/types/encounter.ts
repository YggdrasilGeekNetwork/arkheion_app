// Tipos de cartas do Baralho de Aventuras
export type CardType = 'plot' | 'location' | 'character' | 'object' | 'threat' | 'event'

export const CARD_TYPE_INFO: Record<CardType, { icon: string; label: string; labelPt: string }> = {
  plot: { icon: '📖', label: 'Plot', labelPt: 'Enredo' },
  location: { icon: '🏠', label: 'Location', labelPt: 'Local' },
  character: { icon: '👤', label: 'Character', labelPt: 'Personagem' },
  object: { icon: '🎒', label: 'Object', labelPt: 'Objeto' },
  threat: { icon: '⚠️', label: 'Threat', labelPt: 'Ameaça' },
  event: { icon: '⚡', label: 'Event', labelPt: 'Evento' },
}

// Carta base
export type Card = {
  id: string
  type: CardType
  name: string
  description: string
  subcategory?: string
  tier?: number // Para ameaças (ND 0-4, 5-10, 11-16, 17-20)
}

// Carta comprada
export type DrawnCard = Card & {
  drawnAt: string // ISO date string
  method: 'nimb' | 'khalmyr'
  isCustom?: boolean // Carta criada pelo usuário
}

// Abas do Gerenciador de Encontros
export type EncounterTab = 'enemies' | 'npcs' | 'objects' | 'notes' | 'rewards'

export const ENCOUNTER_TABS: { id: EncounterTab; icon: string; label: string }[] = [
  { id: 'enemies', icon: '👹', label: 'Inimigos' },
  { id: 'npcs', icon: '👤', label: 'NPCs' },
  { id: 'objects', icon: '🎒', label: 'Objetos' },
  { id: 'notes', icon: '📝', label: 'Notas' },
  { id: 'rewards', icon: '🏆', label: 'Recompensas' },
]

// Estado do Baralho de Aventuras
export type AdventureDeckState = {
  drawnCards: DrawnCard[]
  khalmyrOptions: Card[] | null // 3 cartas para escolher no método Khalmyr
  selectedCardType: CardType | null
  isDrawing: boolean
}

// Status de um encontro
export type EncounterStatus = 'draft' | 'ready' | 'active' | 'completed'

// Encontro salvo
export type Encounter = {
  id: string
  name: string
  description?: string
  status: EncounterStatus
  enemies: EncounterEnemy[]
  encounterNpcs: EncounterNPC[]
  encounterObjects: EncounterObject[]
  rewards: Reward[]
  createdAt: string
  updatedAt: string
}

// ========================================
// Hierarquia: Campanha > Aventura > Sessão > Encontro
// ========================================

// Sessão de jogo
export type Session = {
  id: string
  name: string
  number: number
  date?: string
  encounters: Encounter[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// Aventura (arco narrativo)
export type Adventure = {
  id: string
  name: string
  description?: string
  drawnCards: DrawnCard[]
  sessions: Session[]
  createdAt: string
  updatedAt: string
}

// Campanha
export type Campaign = {
  id: string
  name: string
  description?: string
  adventures: Adventure[]
  npcs: NPC[]
  objects: CampaignObject[]
  createdAt: string
  updatedAt: string
}

// Nível de navegação no drill-down
export type NavigationLevel = 'campaigns' | 'adventures' | 'sessions' | 'encounters' | 'encounter-detail'

// Tiers de ameaças
export type ThreatTier = {
  id: string
  label: string
  ndRange: string
}

export const THREAT_TIERS: ThreatTier[] = [
  { id: 'tier1', label: 'Iniciante', ndRange: 'ND 0-4' },
  { id: 'tier2', label: 'Veterano', ndRange: 'ND 5-10' },
  { id: 'tier3', label: 'Campeão', ndRange: 'ND 11-16' },
  { id: 'tier4', label: 'Lendário', ndRange: 'ND 17-20' },
]

// ========================================
// Criaturas e Inimigos
// ========================================

export type CreatureSize = 'Minúsculo' | 'Pequeno' | 'Médio' | 'Grande' | 'Enorme' | 'Colossal'

export type CreatureType =
  | 'Humanoide' | 'Morto-vivo' | 'Construto' | 'Monstro'
  | 'Animal' | 'Espírito' | 'Lefou' | 'Dragão' | 'Elemental'

export const CREATURE_TYPES: CreatureType[] = [
  'Humanoide', 'Morto-vivo', 'Construto', 'Monstro',
  'Animal', 'Espírito', 'Lefou', 'Dragão', 'Elemental',
]

export const CREATURE_SIZES: CreatureSize[] = [
  'Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal',
]

export type CreatureAttack = {
  name: string
  bonus: number
  damage: string
  type?: string
  extra?: string
}

export type Creature = {
  id: string
  name: string
  nd: number
  type: CreatureType
  size: CreatureSize
  ca: number
  pv: number
  deslocamento: string
  attributes: {
    for: number; des: number; con: number
    int: number; sab: number; car: number
  }
  resistances: {
    fortitude: number
    reflexos: number
    vontade: number
  }
  attacks: CreatureAttack[]
  abilities?: string[]
  senses?: string
  treasure?: string
  description?: string
  isCustom?: boolean
}

export type EncounterEnemy = {
  id: string
  creatureId: string
  creature: Creature
  nickname?: string
  currentPv: number
  notes?: string
  addedAt: string
}

// ========================================
// NPCs de Campanha
// ========================================

export type NPCAlignment = 'ally' | 'neutral' | 'enemy'

export const NPC_ALIGNMENT_INFO: Record<NPCAlignment, { label: string; color: string }> = {
  ally: { label: 'Aliado', color: 'text-green-400' },
  neutral: { label: 'Neutro', color: 'text-gray-400' },
  enemy: { label: 'Inimigo', color: 'text-red-400' },
}

export type NPCVersion = {
  id: string
  label: string
  creature?: Creature
  description?: string
  createdAt: string
}

export type NPC = {
  id: string
  name: string
  title?: string
  description?: string
  alignment: NPCAlignment
  isCombatant: boolean
  versions: NPCVersion[]
  createdAt: string
  updatedAt: string
}

export type EncounterNPC = {
  id: string
  npcId: string
  versionId: string
  currentPv?: number
  notes?: string
}

// ========================================
// Objetos de Campanha
// ========================================

export type CampaignObjectType =
  | 'weapon' | 'armor' | 'magic_item' | 'consumable'
  | 'treasure' | 'key_item' | 'other'

export const CAMPAIGN_OBJECT_TYPES: { id: CampaignObjectType; label: string; icon: string }[] = [
  { id: 'weapon', label: 'Arma', icon: '⚔️' },
  { id: 'armor', label: 'Armadura', icon: '🛡️' },
  { id: 'magic_item', label: 'Item Mágico', icon: '✨' },
  { id: 'consumable', label: 'Consumível', icon: '🧪' },
  { id: 'treasure', label: 'Tesouro', icon: '💰' },
  { id: 'key_item', label: 'Item-chave', icon: '🔑' },
  { id: 'other', label: 'Outro', icon: '📦' },
]

export type ObjectRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary'

export const OBJECT_RARITY_INFO: Record<ObjectRarity, { label: string; color: string }> = {
  common: { label: 'Comum', color: 'text-gray-400' },
  uncommon: { label: 'Incomum', color: 'text-green-400' },
  rare: { label: 'Raro', color: 'text-blue-400' },
  very_rare: { label: 'Muito Raro', color: 'text-purple-400' },
  legendary: { label: 'Lendário', color: 'text-amber-400' },
}

export type CampaignObject = {
  id: string
  name: string
  type: CampaignObjectType
  description?: string
  rarity?: ObjectRarity
  value?: string
  properties?: string[]
  createdAt: string
  updatedAt: string
}

export type EncounterObject = {
  id: string
  objectId: string
  quantity: number
  notes?: string
}

// ========================================
// Recompensas
// ========================================

export type RewardType = 'xp' | 'gold' | 'item' | 'other'

export const REWARD_TYPE_INFO: Record<RewardType, { label: string; icon: string }> = {
  xp: { label: 'XP', icon: '⭐' },
  gold: { label: 'Ouro', icon: '💰' },
  item: { label: 'Item', icon: '🎒' },
  other: { label: 'Outro', icon: '📋' },
}

export type Reward = {
  id: string
  type: RewardType
  name: string
  description?: string
  quantity?: number
  value?: number
  objectId?: string
  distributed: boolean
}
