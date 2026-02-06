// Wizard Types for Character Creation

export type WizardStep =
  | 'basic-info'
  | 'race'
  | 'class'
  | 'attributes'
  | 'deity'
  | 'skills'
  | 'abilities'
  | 'equipment'

export const WIZARD_STEPS: WizardStep[] = [
  'basic-info',
  'race',
  'class',
  'attributes',
  'deity',
  'skills',
  'abilities',
  'equipment',
]

export const STEP_LABELS: Record<WizardStep, string> = {
  'basic-info': 'Informações',
  'race': 'Raça',
  'class': 'Classe',
  'attributes': 'Atributos',
  'deity': 'Divindade',
  'skills': 'Perícias',
  'abilities': 'Habilidades',
  'equipment': 'Equipamento',
}

// Choice System Types
export type ChoiceOption = {
  id: string
  name: string
  description?: string
  effects?: {
    attributeBonus?: { attribute: string; value: number }
    skillBonus?: { skill: string; value: number }
    ability?: string
    proficiency?: string
  }
}

export type PendingChoice = {
  id: string
  type: 'single' | 'multiple'
  source: string
  sourceStep: WizardStep
  title: string
  description?: string
  options: ChoiceOption[]
  minSelections: number
  maxSelections: number
  selectedOptions: string[]
  isResolved: boolean
  dependsOn?: string
}

// Attribute allocation method
export type AttributeMethod = 'point-buy' | 'standard-array' | 'manual'

// Equipment selection method
export type EquipmentMethod = 'package' | 'gold'

// Selected race data
export type RaceSelection = {
  id: string
  name: string
  subRace?: {
    id: string
    name: string
  }
}

// Selected class data
export type ClassSelection = {
  id: string
  name: string
  level: number
  archetype?: {
    id: string
    name: string
  }
}

// Attributes object
export type AttributeValues = {
  FOR: number
  DES: number
  CON: number
  INT: number
  SAB: number
  CAR: number
}

// Equipment selection from wizard
export type EquipmentSelection = {
  weapons: Array<{ id: string; name: string }>
  armor: Array<{ id: string; name: string }>
  items: Array<{ id: string; name: string; quantity?: number }>
}

// Computed values derived from choices
export type ComputedValues = {
  totalLevel: number
  attributeBonuses: Array<{ attribute: string; value: number; source: string }>
  skillBonuses: Array<{ skill: string; value: number; source: string }>
  grantedAbilities: Array<{ id: string; name: string; source: string }>
  grantedProficiencies: Array<{ type: string; name: string; source: string }>
  availableSkillPoints: number
  usedSkillPoints: number
  maxHealth: number
  maxMana: number
}

// Main Wizard State
export type WizardState = {
  currentStep: WizardStep
  completedSteps: WizardStep[]
  isSubmitting: boolean
  errors: Record<WizardStep, string[]>

  // Pending choices generated during the process
  pendingChoices: PendingChoice[]

  // Form data
  data: {
    // Step 1: Basic Info
    name: string
    imageUrl: string
    origin: { id: string; name: string } | null

    // Step 2: Race
    race: RaceSelection | null

    // Step 3: Class(es)
    classes: ClassSelection[]

    // Step 4: Attributes
    attributeMethod: AttributeMethod
    attributes: AttributeValues

    // Step 5: Deity
    deity: { id: string; name: string } | null
    selectedPowers: string[] // IDs of selected deity powers

    // Step 6: Skills
    trainedSkills: string[]

    // Step 7: Abilities
    selectedAbilities: string[]

    // Step 8: Equipment
    equipmentMethod: EquipmentMethod
    startingEquipment: EquipmentSelection
    currencies: { tc: number; tp: number; to: number }
  }

  // Computed values (updated when choices change)
  computed: ComputedValues
}

// Initial state for the wizard
export const initialWizardState: WizardState = {
  currentStep: 'basic-info',
  completedSteps: [],
  isSubmitting: false,
  errors: {
    'basic-info': [],
    'race': [],
    'class': [],
    'attributes': [],
    'deity': [],
    'skills': [],
    'abilities': [],
    'equipment': [],
  },
  pendingChoices: [],
  data: {
    name: '',
    imageUrl: '',
    origin: null,
    race: null,
    classes: [],
    attributeMethod: 'point-buy',
    attributes: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
    deity: null,
    selectedPowers: [],
    trainedSkills: [],
    selectedAbilities: [],
    equipmentMethod: 'package',
    startingEquipment: { weapons: [], armor: [], items: [] },
    currencies: { tc: 0, tp: 0, to: 0 },
  },
  computed: {
    totalLevel: 0,
    attributeBonuses: [],
    skillBonuses: [],
    grantedAbilities: [],
    grantedProficiencies: [],
    availableSkillPoints: 0,
    usedSkillPoints: 0,
    maxHealth: 0,
    maxMana: 0,
  },
}

// API Data Types (what comes from the API)
export type RaceData = {
  id: string
  name: string
  description: string
  attributeBonuses: Array<{ attribute: string; value: number }>
  skillBonuses?: Array<{ skill: string; value: number }>
  abilities: Array<{
    id: string
    name: string
    description: string
    type: 'passive' | 'active'
  }>
  choices?: Array<{
    id: string
    title: string
    description?: string
    type: 'single' | 'multiple'
    minSelections: number
    maxSelections: number
    options: ChoiceOption[]
    targetStep: WizardStep
  }>
  subRaces?: Array<{
    id: string
    name: string
    description: string
    attributeBonuses?: Array<{ attribute: string; value: number }>
    abilities?: Array<{
      id: string
      name: string
      description: string
      type: 'passive' | 'active'
    }>
  }>
  size: 'Pequeno' | 'Médio' | 'Grande'
  speed: number
}

export type ClassData = {
  id: string
  name: string
  description: string
  hitDie: number // e.g., 10 for d10
  primaryAttributes: string[]
  savingThrows: string[]
  skillChoices: {
    count: number
    options: string[]
  }
  proficiencies: {
    armor: string[]
    weapons: string[]
    tools: string[]
  }
  abilities: Array<{
    id: string
    name: string
    description: string
    type: 'passive' | 'active'
    level: number // Level at which this ability is gained
  }>
  choices?: Array<{
    id: string
    title: string
    description?: string
    type: 'single' | 'multiple'
    minSelections: number
    maxSelections: number
    options: ChoiceOption[]
    targetStep: WizardStep
    level?: number // Level at which this choice becomes available
  }>
  archetypes?: Array<{
    id: string
    name: string
    description: string
    level: number // Level at which archetype is chosen
    abilities: Array<{
      id: string
      name: string
      description: string
      type: 'passive' | 'active'
      level: number
    }>
  }>
  spellcasting?: {
    attribute: string
    type: 'arcana' | 'divina'
    knownSpellsPerLevel: number[]
  }
  manaPerLevel: number[] // Mana gained at each level
}

// Deity power granted to followers
export type DeityPower = {
  id: string
  name: string
  description: string
  type: 'passive' | 'active'
  actionType?: 'padrão' | 'movimento' | 'livre' | 'completa' | 'reação'
  cost?: { pm?: number; pv?: number }
  prerequisites?: string[] // IDs of other powers required
}

export type DeityData = {
  id: string
  name: string
  description: string
  alignment: string
  domains: string[]
  // New detailed fields
  values: string // What the deity values
  energy: 'positiva' | 'negativa' // Energy channeled
  favoriteWeapon: string // Deity's favored weapon
  obligations: string[] // What followers must do
  restrictions: string[] // What followers must not do
  powers: DeityPower[] // Available powers to choose from
}

export type OriginData = {
  id: string
  name: string
  description: string
  skillBonuses?: Array<{ skill: string; value: number }>
  abilities?: Array<{
    id: string
    name: string
    description: string
    type: 'passive' | 'active'
  }>
  choices?: Array<{
    id: string
    title: string
    description?: string
    type: 'single' | 'multiple'
    minSelections: number
    maxSelections: number
    options: ChoiceOption[]
    targetStep: WizardStep
  }>
  startingEquipment?: Array<{
    id: string
    name: string
    quantity?: number
  }>
  startingGold?: number
}

// Loader data for the wizard page
export type WizardLoaderData = {
  races: RaceData[]
  classes: ClassData[]
  deities: DeityData[]
  origins: OriginData[]
  skills: Array<{ name: string; attribute: string; description?: string }>
}
