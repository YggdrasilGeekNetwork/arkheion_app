import type { Ability, CharacterClass } from './character'

export type LevelUpStep = 'class' | 'attributes' | 'abilities' | 'skills' | 'review'

// Dados de classe para cálculos de level up
export type ClassLevelUpInfo = {
  name: string
  hitDie: number // d6 = 6, d8 = 8, d10 = 10, d12 = 12
  mpPerLevel: number // PM base por nível
  mpAttribute: string // Atributo que adiciona PM (INT, SAB, CAR, etc)
  skillsPerLevel?: number // Perícias ganhas por nível (opcional)
  availableAbilities?: Ability[] // Habilidades disponíveis no novo nível
}

// Dados do level up sendo configurado
export type LevelUpData = {
  classId: string
  className: string
  previousLevel: number
  newLevel: number
  hpGained: number
  hpRoll: number // O resultado do dado
  mpGained: number
  attributeIncrease?: {
    attribute: string
    previousValue: number
    newValue: number
    previousModifier: number
    newModifier: number
  }
  newAbilities: Ability[]
  newSkills: string[]
}

// Estado interno do modal de level up
export type LevelUpState = {
  currentStep: LevelUpStep
  // Step 1: Classe
  selectedClassId: string | null
  isNewClass: boolean
  newClassName?: string // Se for nova classe
  hpRoll: number | null
  // Step 2: Atributos (condicional)
  attributeChoice: string | null
  // Step 3: Habilidades
  selectedAbilities: Ability[]
  availableAbilities: Ability[]
  // Step 4: Perícias
  selectedSkills: string[]
  availableSkills: string[]
  maxSkillsToSelect: number
}

// Informações de classes do Tormenta 20
export const CLASS_INFO: Record<string, ClassLevelUpInfo> = {
  'Guerreiro': {
    name: 'Guerreiro',
    hitDie: 10,
    mpPerLevel: 3,
    mpAttribute: 'FOR',
  },
  'Paladino': {
    name: 'Paladino',
    hitDie: 10,
    mpPerLevel: 3,
    mpAttribute: 'CAR',
  },
  'Cavaleiro': {
    name: 'Cavaleiro',
    hitDie: 10,
    mpPerLevel: 3,
    mpAttribute: 'CAR',
  },
  'Bárbaro': {
    name: 'Bárbaro',
    hitDie: 12,
    mpPerLevel: 3,
    mpAttribute: 'FOR',
  },
  'Ladino': {
    name: 'Ladino',
    hitDie: 8,
    mpPerLevel: 4,
    mpAttribute: 'DES',
  },
  'Bardo': {
    name: 'Bardo',
    hitDie: 8,
    mpPerLevel: 4,
    mpAttribute: 'CAR',
  },
  'Inventor': {
    name: 'Inventor',
    hitDie: 8,
    mpPerLevel: 4,
    mpAttribute: 'INT',
  },
  'Caçador': {
    name: 'Caçador',
    hitDie: 10,
    mpPerLevel: 4,
    mpAttribute: 'SAB',
  },
  'Lutador': {
    name: 'Lutador',
    hitDie: 10,
    mpPerLevel: 4,
    mpAttribute: 'FOR',
  },
  'Clérigo': {
    name: 'Clérigo',
    hitDie: 8,
    mpPerLevel: 5,
    mpAttribute: 'SAB',
  },
  'Druida': {
    name: 'Druida',
    hitDie: 8,
    mpPerLevel: 5,
    mpAttribute: 'SAB',
  },
  'Mago': {
    name: 'Mago',
    hitDie: 6,
    mpPerLevel: 6,
    mpAttribute: 'INT',
  },
  'Arcanista': {
    name: 'Arcanista',
    hitDie: 6,
    mpPerLevel: 6,
    mpAttribute: 'INT',
  },
  'Feiticeiro': {
    name: 'Feiticeiro',
    hitDie: 6,
    mpPerLevel: 6,
    mpAttribute: 'CAR',
  },
  'Bruxo': {
    name: 'Bruxo',
    hitDie: 8,
    mpPerLevel: 5,
    mpAttribute: 'CAR',
  },
  'Nobre': {
    name: 'Nobre',
    hitDie: 8,
    mpPerLevel: 4,
    mpAttribute: 'CAR',
  },
}

// Níveis em que o personagem ganha +1 de atributo
export const ATTRIBUTE_INCREASE_LEVELS = [4, 8, 12, 16, 20]

// Verifica se o nível total concede aumento de atributo
export function shouldIncreaseAttribute(newTotalLevel: number): boolean {
  return ATTRIBUTE_INCREASE_LEVELS.includes(newTotalLevel)
}

// Calcula o modificador a partir do valor do atributo
export function getModifierFromValue(value: number): number {
  return Math.floor((value - 10) / 2)
}

// Rola o dado de vida
export function rollHitDie(hitDie: number): number {
  return Math.floor(Math.random() * hitDie) + 1
}

// Calcula HP ganho no level up
export function calculateHpGained(hpRoll: number, conModifier: number): number {
  return Math.max(1, hpRoll + conModifier)
}

// Calcula PM ganho no level up
export function calculateMpGained(className: string, attributeModifier: number): number {
  const classInfo = CLASS_INFO[className]
  if (!classInfo) return 0
  return Math.max(1, classInfo.mpPerLevel + attributeModifier)
}
