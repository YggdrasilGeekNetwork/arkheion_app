export type CharacterClass = {
  name: string
  level: number
  tooltip?: string
}

export type CharacterInfo = {
  name: string
  tooltip?: string
}

export type Attribute = {
  label: string
  value: number
  modifier: number
  visible: boolean
}

export type Resistance = {
  value: number
  name: string
  tooltip: string
  visible: boolean
}

export type Defense = {
  value: number
  name: string
  tooltip: string
}

export type Skill = {
  name: string
  modifier: number
  trained: boolean
  attribute: string
  tooltip?: string
  visibleInCombat?: boolean
  visibleInSummary?: boolean
  // Detalhes do cálculo (opcionais)
  levelBonus?: number // Metade do nível
  trainingBonus?: number // Bônus de treinamento (+2 se trained)
  otherBonuses?: Array<{ label: string; value: number }> // Outros bônus com origem
}

export type EquipmentItem = {
  id: string
  name: string
  description?: string
}

export type EquippedItems = {
  rightHand: EquipmentItem | null
  leftHand: EquipmentItem | null
  quickDraw1: EquipmentItem | null
  quickDraw2: EquipmentItem | null
  slot1: EquipmentItem | null
  slot2: EquipmentItem | null
  slot3: EquipmentItem | null
  slot4: EquipmentItem | null
}

export type Currencies = {
  tc: number // Tibares de Cobre
  tp: number // Tibares de Prata
  to: number // Tibares de Ouro
}

export type CombatAction = {
  id: string
  name: string
  type: 'standard' | 'movement' | 'free' | 'full' | 'reaction' | 'other'
  cost?: { pm?: number; pv?: number }
  effect: string
  tooltip?: string
  modal?: boolean
  choices?: string[]
  isFavorite?: boolean
  favoriteOrder?: number // Ordem de exibição nos favoritos
  usesPerTurn?: number // Quantas vezes pode ser usada por turno (undefined = ilimitado)
  usedThisTurn?: number // Quantas vezes já foi usada neste turno
  resistance?: string // Resistência necessária (ex: "Fortitude CD 15", "Vontade CD 18")
}

export type AvailableActions = {
  standard: number
  movement: number
  free: number
  full: number
  reaction: number
}

export type Character = {
  id: string
  name: string
  imageUrl?: string
  classes: CharacterClass[]
  origin?: CharacterInfo
  deity?: CharacterInfo

  // Resources
  health: number
  maxHealth: number
  mana: number
  maxMana: number

  // Attributes
  attributes: Attribute[]

  // Combat
  resistances: Resistance[]
  defenses: Defense[]
  initiativeRoll: number
  isMyTurn: boolean
  turnOrder: number
  availableActions: AvailableActions
  actionsList: CombatAction[]
  weapons: WeaponAttack[]

  // Skills
  skills: Skill[]

  // Equipment
  equippedItems: EquippedItems
  backpack: (EquipmentItem | null)[]
  currencies: Currencies

  // Metadata
  updatedAt: string
  version: number
}

export type WeaponAttack = {
  id: string
  name: string
  damage: string
  damageType?: string
  attackBonus: number
  attackAttribute?: string // Atributo usado para o ataque (FOR, DES, etc)
  critRange?: string
  critMultiplier?: string
  range?: string
  actionType: 'standard' | 'full'
  isFavorite?: boolean
  favoriteOrder?: number // Ordem de exibição nos favoritos
}

export type CharacterSummary = {
  id: string
  name: string
  imageUrl?: string
  classes: CharacterClass[]
  level: number
}
