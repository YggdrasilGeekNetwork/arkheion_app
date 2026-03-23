// Wizard Types for Character Creation

export type WizardStep =
  | 'basic-info'
  | 'race'
  | 'class'
  | 'origin'
  | 'attributes'
  | 'deity'
  | 'skills'
  | 'abilities'
  | 'equipment'

export const WIZARD_STEPS: WizardStep[] = [
  'attributes',
  'race',
  'class',
  'origin',
  'deity',
  'skills',
  'abilities',
  'equipment',
  'basic-info',
]

export const STEP_LABELS: Record<WizardStep, string> = {
  'attributes': 'Atributos',
  'race': 'Raça',
  'class': 'Classe',
  'origin': 'Origem',
  'deity': 'Divindade',
  'skills': 'Perícias',
  'abilities': 'Habilidades',
  'equipment': 'Equipamento',
  'basic-info': 'Toques Finais',
}

// Choice System Types
export type ChoiceOption = {
  id: string
  name: string
  description?: string
  school?: string      // spell school code, e.g. 'abjur'
  schoolName?: string  // Portuguese name, e.g. 'Abjuração'
  effects?: {
    attributeBonus?: { attribute: string; value: number }
    skillBonus?: { skill: string; value: number }
    ability?: string
    proficiency?: string
  }
}

export type PowerPrerequisite = {
  type: string
  sub_type: 'hard' | 'soft' | string
  attr?: string | string[]
  value?: number
  skill?: string
  id?: string
}

export type ChoiceEffectType = 'attribute-bonus' | 'versatil-mode' | 'deformidade-mode' | 'skill-bonus' | 'memoria-postuma-mode' | 'spell-grant' | 'skill-training' | 'element-choice' | 'caminho-do-arcanista' | 'linhagem-do-feiticeiro' | 'origem-mode' | 'escola-de-magias'

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
  effectType?: ChoiceEffectType
  effectValue?: number
  dependsOn?: string
  availableSkills?: Array<{ id: string; name: string }>
  availablePowers?: Array<{ id: string; name: string; description?: string; prerequisites?: PowerPrerequisite[] }>
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
    // Step 1: Attributes
    attributeMethod: AttributeMethod
    attributes: AttributeValues

    // Step 2: Race
    race: RaceSelection | null

    // Step 3: Class(es)
    classes: ClassSelection[]

    // Step 4: Origin
    origin: { id: string; name: string } | null

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

    // Step 9: Toques Finais
    name: string
    imageUrl: string
  }

  // Computed values (updated when choices change)
  computed: ComputedValues
}

// Initial state for the wizard
export const initialWizardState: WizardState = {
  currentStep: 'attributes',
  completedSteps: [],
  isSubmitting: false,
  errors: {
    'attributes': [],
    'race': [],
    'class': [],
    'origin': [],
    'deity': [],
    'skills': [],
    'abilities': [],
    'equipment': [],
    'basic-info': [],
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
  size: string
  speed: number
  attributeBonuses: Array<{ attribute: string; value: number }>
  abilities: Array<{ id: string; name: string; description?: string }>
  choices?: Array<{
    id: string
    title: string
    description?: string
    type: 'single' | 'multiple'
    minSelections: number
    maxSelections: number
    options: ChoiceOption[]
    targetStep: WizardStep
    effectType?: ChoiceEffectType
    effectValue?: number
  }>
}

export type ClassData = {
  id: string
  name: string
  description: string
  hpPerLevel: number
  mpPerLevel: number
  spellcasting: { attribute?: string } | null
  skillChoices: {
    mandatory: string[]
    count: number
    options: string[]
  }
  proficiencies: {
    weapons: string[]
    armors: string[]
    shields: boolean
  }
  abilities: Array<{ id: string; name: string; description?: string; level?: number }>
  choices?: Array<{
    id: string
    title: string
    description?: string
    type: 'single' | 'multiple'
    minSelections: number
    maxSelections: number
    options: ChoiceOption[]
    targetStep: WizardStep
    effectType?: ChoiceEffectType
    effectValue?: number
    dependsOn?: string
    level?: number
  }>
}

// Deity power granted to followers
export type DeityPower = {
  id: string
  name: string
  description?: string
  type?: 'passive' | 'active'
  actionType?: string
  cost?: { pm?: number; pv?: number }
}

export type DeityData = {
  id: string
  name: string
  title?: string
  description: string
  energy: string
  preferredWeapon?: string
  beliefsObjectives?: string
  obligationsRestrictions?: string
  grantedPowers: DeityPower[]
}

export type OriginChoice = {
  id: string
  title: string
  description?: string
  type: 'single' | 'multiple'
  minSelections: number
  maxSelections: number
  targetStep: WizardStep
  effectType?: ChoiceEffectType
  options: ChoiceOption[]
  availableSkills?: Array<{ id: string; name: string }>
  availablePowers?: Array<{ id: string; name: string; description?: string; prerequisites?: PowerPrerequisite[] }>
}

export type OriginData = {
  id: string
  name: string
  description: string
  skills: string[]
  items?: string[]
  powers: Array<{ id: string; name: string; description?: string; prerequisites?: PowerPrerequisite[] }>
  specialNote?: string
  choices?: OriginChoice[]
}

// Loader data for the wizard page
export type WizardLoaderData = {
  races: RaceData[]
  classes: ClassData[]
  deities: DeityData[]
  origins: OriginData[]
  skills: Array<{ name: string; attribute: string; description?: string }>
  generalPowers: Array<{ id: string; name: string; description?: string; prerequisites?: PowerPrerequisite[] }>
  tormentaPowers: Array<{ id: string; name: string; description?: string; prerequisites?: PowerPrerequisite[] }>
  simpleWeapons: Array<{ id: string; name: string; damage?: string; damageType?: string; critical?: string; range?: string }>
  martialWeapons: Array<{ id: string; name: string; damage?: string; damageType?: string; critical?: string; range?: string }>
}
