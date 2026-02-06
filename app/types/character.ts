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

export type ItemEffect = {
  id: string
  name: string
  description: string
  type: 'passive' | 'active' | 'consumable'
  // For passive effects (automatically applied when equipped)
  passiveModifiers?: {
    attribute?: { label: string; bonus: number } // e.g., +2 FOR
    defense?: { type: string; bonus: number } // e.g., +1 CA
    resistance?: { type: string; bonus: number } // e.g., +3 Fortitude
    skill?: { name: string; bonus: number } // e.g., +5 Percepção
    other?: { label: string; value: string } // Custom effects
  }
  // For active/consumable effects
  activeAbility?: {
    name: string
    description: string
    actionType: 'standard' | 'movement' | 'free' | 'full' | 'reaction'
    cost?: { pm?: number; pv?: number }
    usesPerDay?: number
    consumeItem?: boolean // If true, item is consumed when used
  }
}

export type EquipmentItem = {
  id: string
  name: string
  description?: string
  quantity?: number
  weight?: number // Weight per unit in kg
  spaces?: number // Spaces occupied (for carry capacity)
  price?: number // Price in TP (Tibares de Prata)
  category?: 'weapon' | 'armor' | 'equipment' | 'alchemical' | 'tool' | 'clothing' | 'esoteric' | 'food' | 'other'
  effects?: ItemEffect[] // Item effects (passive or active)
}

export type ActiveEffect = {
  id: string
  name: string
  description: string
  source: string
  type: 'active' | 'consumable'
  duration?: string
  modifiers?: ItemEffect['passiveModifiers']
  consumeOnAttack?: boolean // If true, effect is removed when an attack is made
}

export type Ability = {
  id: string
  name: string
  description: string
  type: 'active' | 'passive'
  actionType?: 'standard' | 'movement' | 'free' | 'full' | 'reaction'
  cost?: { pm?: number; pv?: number }
  usesPerDay?: number
  source?: string
  isFavorite?: boolean
  favoriteOrder?: number
}

export type SpellEffect = {
  type: string // 'bônus', 'dano', etc.
  attribute?: string // 'ca', 'ataque', etc.
  amount?: string // '+4', '2d6', etc.
  resistanceRequirement?: string
  extraRequirements?: string
}

export type SpellEnhancement = {
  cost: number // PM cost
  type: 'muda' | 'aumenta'
  description: string
  extraDetails?: {
    execution?: string
    duration?: string
    circle?: number
    effects?: SpellEffect[]
  }
}

export type SpellTarget = {
  amount?: number | null
  upTo?: number | null
  type: string // 'você', 'uma criatura', etc.
}

export type Spell = {
  id: string
  name: string
  type: 'arcana' | 'divina'
  circle: number
  school: string // 'abjur', 'evoc', 'trans', 'necro', 'adiv', 'encan', 'ilusão', 'conv'
  execution: string // 'padrão', 'movimento', 'completa', 'reação', 'livre'
  executionDetails?: string
  range: string // 'pessoal', 'toque', 'curto', 'médio', 'longo'
  target?: SpellTarget
  areaEffect?: string
  areaEffectDetails?: string
  counterspell?: string
  duration: string
  durationDetails?: string
  resistance?: string // 'Fortitude', 'Reflexos', 'Vontade'
  extraCosts?: string
  description: string
  enhancements?: SpellEnhancement[]
  effects?: SpellEffect[]
  isFavorite?: boolean
  favoriteOrder?: number
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
  inCombat?: boolean
  initiativeRoll: number | null
  isMyTurn: boolean
  turnOrder: number
  availableActions: AvailableActions
  actionsList: CombatAction[]
  weapons: WeaponAttack[]

  // Skills
  skills: Skill[]

  // Abilities & Spells
  abilities?: Ability[]
  spells?: Spell[]

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
