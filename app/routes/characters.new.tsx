import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { requireUserToken } from '~/utils/session.server'
import { useLoaderData, useNavigation } from '@remix-run/react'
import { WizardProvider } from '~/contexts/WizardContext'
import CharacterCreationWizard from '~/components/wizard/CharacterCreationWizard'
import type { WizardLoaderData, WizardStep, RaceData, ClassData, DeityData, OriginData, ChoiceEffectType } from '~/types/wizard'
import { gqlRequest } from '~/utils/graphql.server'
import { WIZARD_DATA_QUERY, CREATE_CHARACTER_MUTATION } from '~/graphql/characters'
import type { PendingChoice } from '~/types/wizard'

// ── Spellcasting attribute map (gem column is unpopulated) ──────────────────
const SPELLCASTING_ATTRS: Record<string, string> = {
  arcanista: 'INT',
  clerigo: 'SAB',
  druida: 'SAB',
  bardo: 'CAR',
  cacador: 'SAB',
}

// ── Attribute name mapping (Portuguese full → uppercase abbrev) ─────────────
const PT_ATTR_MAP: Record<string, string> = {
  forca: 'FOR',
  destreza: 'DES',
  constituicao: 'CON',
  inteligencia: 'INT',
  sabedoria: 'SAB',
  carisma: 'CAR',
}

// ── API response types ──────────────────────────────────────────────────────
type ApiPoder = { id: string; name: string; description?: string; effects?: unknown; prerequisites?: unknown[] }

type ApiChoice = {
  id: string
  title: string
  description?: string
  type: 'single' | 'multiple'
  minSelections: number
  maxSelections: number
  targetStep: string
  effectType?: string
  effectValue?: number
  dependsOn?: string
  options: Array<{ id: string; name: string; description?: string }>
}

type ApiRaceChoice = ApiChoice

type ApiRaca = {
  id: string; name: string; description?: string
  size?: string; movement?: number
  attributeBonuses?: Record<string, number>
  racialAbilities?: string[]
  chosenAbilitiesAmount?: number
  availableChosenAbilities?: string[]
  choices?: ApiRaceChoice[]
}

type ApiClasse = {
  id: string; name: string
  hitPoints?: { initial?: number; per_level?: number }
  manaPoints?: { per_level?: number }
  skills?: {
    mandatory?: Array<{ name: string }>
    choose_amount?: number
    choose_from?: Array<{ name: string }>
  }
  proficiencies?: { weapons?: string[]; armors?: string[]; shields?: boolean }
  abilities?: string[]
  spellcasting?: unknown
  choices?: ApiChoice[]
  progression?: Array<{ level: number; abilities: string[] }>
}

type ApiOrigem = {
  id: string; name: string; description?: string
  benefits?: { skills?: string[]; powers?: string[]; special?: string }
  choices?: Array<{
    id: string; title: string; description?: string
    type: 'single' | 'multiple'
    minSelections: number; maxSelections: number
    targetStep: string; effectType?: string
    options: Array<{ id: string; name: string; description?: string }>
    availableSkills?: Array<{ id: string; name: string }>
    availablePowers?: Array<{ id: string; name: string; description?: string }>
  }>
}

type ApiDivindade = {
  id: string; name: string; title?: string; description?: string
  energy?: string; preferredWeapon?: string
  grantedPowers?: string[]
  obligationsRestrictions?: string
  beliefsObjectives?: string
}

type ApiResponse = {
  rulebook: {
    racas: ApiRaca[]
    classes: ApiClasse[]
    origens: ApiOrigem[]
    divindades: ApiDivindade[]
    racialPowers: ApiPoder[]
    classPowers: ApiPoder[]
    deityPowers: ApiPoder[]
    generalPowers: ApiPoder[]
    tormentaPowers: ApiPoder[]
    simpleWeapons: ApiArma[]
    martialWeapons: ApiArma[]
  }
}

type ApiArma = { id: string; name: string; damage?: string; damageType?: string; critical?: string; range?: string }

// ── Transformation helpers ──────────────────────────────────────────────────

function parsePowerEffects(effects: unknown): { type?: 'active' | 'passive'; cost?: { pm?: number } } {
  if (!effects || typeof effects !== 'object' || Array.isArray(effects)) return {}
  const e = effects as Record<string, unknown>
  const type = e.type === 'active' ? 'active' : e.type === 'passive' ? 'passive' : undefined
  const costStr = typeof e.cost === 'string' ? e.cost : null
  const pm = costStr ? parseInt(costStr) || undefined : undefined
  return { type, cost: pm ? { pm } : undefined }
}

function buildPowersIndex(powers: ApiPoder[]): Map<string, ApiPoder> {
  return new Map(powers.map(p => [p.id, p]))
}

function transformRaces(racas: ApiRaca[], index: Map<string, ApiPoder>): RaceData[] {
  return racas.map(r => {
    // Gem ability pool choices (e.g. race with selectable racial abilities)
    const choiceCount = r.chosenAbilitiesAmount ?? 0
    const choicePool = r.availableChosenAbilities ?? []
    const gemAbilityChoices: NonNullable<RaceData['choices']> =
      choiceCount > 0 && choicePool.length > 0
        ? [{
            id: `${r.id}-ability-choice`,
            title: `Escolha ${choiceCount} habilidade${choiceCount > 1 ? 's' : ''} racial${choiceCount > 1 ? 'is' : ''}`,
            description: `Escolha ${choiceCount} das habilidades raciais disponíveis para ${r.name}`,
            type: 'multiple' as const,
            minSelections: choiceCount,
            maxSelections: choiceCount,
            options: choicePool.map(id => {
              const p = index.get(id)
              return { id, name: p?.name || id, description: p?.description }
            }),
            targetStep: 'race' as const,
          }]
        : []

    // Rule-based choices provided by the API (RaceChoicesBuilder on the backend)
    const apiChoices: NonNullable<RaceData['choices']> = (r.choices ?? []).map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      minSelections: c.minSelections,
      maxSelections: c.maxSelections,
      options: c.options,
      targetStep: c.targetStep as WizardStep,
      effectType: c.effectType as ChoiceEffectType | undefined,
      effectValue: c.effectValue,
    }))

    const choices = [...gemAbilityChoices, ...apiChoices]

    return {
      id: r.id,
      name: r.name,
      description: r.description || '',
      size: r.size ? r.size.charAt(0).toUpperCase() + r.size.slice(1) : 'Médio',
      speed: r.movement ?? 9,
      attributeBonuses: Object.entries(r.attributeBonuses || {})
        .map(([attr, val]) => ({ attribute: PT_ATTR_MAP[attr] || attr.toUpperCase(), value: val }))
        .filter(b => b.value !== 0),
      abilities: (r.racialAbilities || []).map(id => {
        const p = index.get(id)
        return { id, name: p?.name || id, description: p?.description }
      }),
      choices: choices.length > 0 ? choices : undefined,
    }
  })
}

function transformClasses(classes: ApiClasse[], index: Map<string, ApiPoder>): ClassData[] {
  return classes.map(c => {
    // Build ability ID → level map from progression
    const abilityLevel: Record<string, number> = {}
    for (const entry of (c.progression || [])) {
      for (const abilityId of (entry.abilities || [])) {
        if (!(abilityId in abilityLevel)) abilityLevel[abilityId] = entry.level
      }
    }

    return {
    id: c.id,
    name: c.name,
    description: '',
    hpPerLevel: c.hitPoints?.per_level ?? 4,
    mpPerLevel: c.manaPoints?.per_level ?? 3,
    spellcasting: SPELLCASTING_ATTRS[c.id] ? { attribute: SPELLCASTING_ATTRS[c.id] } : null,
    skillChoices: {
      mandatory: (c.skills?.mandatory || []).map(s => s.name),
      count: c.skills?.choose_amount ?? 2,
      options: (c.skills?.choose_from || []).map(s => s.name),
    },
    proficiencies: {
      weapons: (c.proficiencies?.weapons || []).map(w => w.charAt(0).toUpperCase() + w.slice(1)),
      armors: (c.proficiencies?.armors || []).map(a => a.charAt(0).toUpperCase() + a.slice(1)),
      shields: c.proficiencies?.shields ?? false,
    },
    abilities: (c.abilities || []).map(id => {
      const p = index.get(id)
      return { id, name: p?.name || id, description: p?.description, level: abilityLevel[id] }
    }),
    choices: (c.choices ?? []).length > 0
      ? (c.choices ?? []).map(ch => ({
          id: ch.id,
          title: ch.title,
          description: ch.description,
          type: ch.type,
          minSelections: ch.minSelections,
          maxSelections: ch.maxSelections,
          options: ch.options,
          targetStep: ch.targetStep as WizardStep,
          effectType: ch.effectType as ChoiceEffectType | undefined,
          effectValue: ch.effectValue,
          dependsOn: ch.dependsOn,
        }))
      : undefined,
  }
  })
}

function transformOrigins(origens: ApiOrigem[]): OriginData[] {
  return origens.map(o => ({
    id: o.id,
    name: o.name,
    description: o.description || '',
    skills: o.benefits?.skills || [],
    powers: (o.choices?.[0]?.availablePowers ?? []),
    specialNote: o.benefits?.special,
    choices: (o.choices ?? []).map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      minSelections: c.minSelections,
      maxSelections: c.maxSelections,
      targetStep: c.targetStep as import('~/types/wizard').WizardStep,
      effectType: c.effectType as import('~/types/wizard').ChoiceEffectType | undefined,
      options: c.options,
      availableSkills: c.availableSkills,
      availablePowers: c.availablePowers,
    })),
  }))
}

function transformDeities(divindades: ApiDivindade[], index: Map<string, ApiPoder>): DeityData[] {
  return divindades.map(d => ({
    id: d.id,
    name: d.name,
    title: d.title,
    description: d.description || '',
    energy: d.energy || 'positiva',
    preferredWeapon: d.preferredWeapon,
    beliefsObjectives: d.beliefsObjectives,
    obligationsRestrictions: d.obligationsRestrictions,
    grantedPowers: (d.grantedPowers || []).map(id => {
      const p = index.get(id)
      const parsed = parsePowerEffects(p?.effects)
      return { id, name: p?.name || id, description: p?.description, ...parsed }
    }),
  }))
}

// ── Skills (static game data) ───────────────────────────────────────────────
const SKILLS = [
  { name: 'Acrobacia', attribute: 'DES' },
  { name: 'Adestramento', attribute: 'CAR' },
  { name: 'Atletismo', attribute: 'FOR' },
  { name: 'Atuação', attribute: 'CAR' },
  { name: 'Cavalgar', attribute: 'DES' },
  { name: 'Conhecimento', attribute: 'INT' },
  { name: 'Cura', attribute: 'SAB' },
  { name: 'Diplomacia', attribute: 'CAR' },
  { name: 'Enganação', attribute: 'CAR' },
  { name: 'Fortitude', attribute: 'CON' },
  { name: 'Furtividade', attribute: 'DES' },
  { name: 'Guerra', attribute: 'INT' },
  { name: 'Iniciativa', attribute: 'DES' },
  { name: 'Intimidação', attribute: 'CAR' },
  { name: 'Intuição', attribute: 'SAB' },
  { name: 'Investigação', attribute: 'INT' },
  { name: 'Jogatina', attribute: 'CAR' },
  { name: 'Ladinagem', attribute: 'DES' },
  { name: 'Luta', attribute: 'FOR' },
  { name: 'Misticismo', attribute: 'INT' },
  { name: 'Nobreza', attribute: 'INT' },
  { name: 'Ofício', attribute: 'INT' },
  { name: 'Percepção', attribute: 'SAB' },
  { name: 'Pilotagem', attribute: 'DES' },
  { name: 'Pontaria', attribute: 'DES' },
  { name: 'Reflexos', attribute: 'DES' },
  { name: 'Religião', attribute: 'SAB' },
  { name: 'Sobrevivência', attribute: 'SAB' },
  { name: 'Vontade', attribute: 'SAB' },
]

// ── Loader ──────────────────────────────────────────────────────────────────
export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requireUserToken(request)

  try {
    const result = await gqlRequest<ApiResponse>(WIZARD_DATA_QUERY, {}, token)
    const rulebook = result.data?.rulebook

    if (!rulebook) throw new Error('No rulebook data')

    const powersIndex = buildPowersIndex([
      ...rulebook.racialPowers,
      ...rulebook.classPowers,
      ...rulebook.deityPowers,
    ])

    const mapPowers = (arr: ApiPoder[]) =>
      (arr || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        prerequisites: (p.prerequisites || []) as import('~/types/wizard').PowerPrerequisite[],
      }))

    return json<WizardLoaderData>({
      races: transformRaces(rulebook.racas, powersIndex),
      classes: transformClasses(rulebook.classes, powersIndex),
      origins: transformOrigins(rulebook.origens),
      deities: transformDeities(rulebook.divindades, powersIndex),
      skills: SKILLS,
      generalPowers: mapPowers(rulebook.generalPowers),
      tormentaPowers: mapPowers(rulebook.tormentaPowers),
      simpleWeapons: (rulebook.simpleWeapons || []).filter(w => w.id !== 'test_arma').map(w => ({ id: w.id, name: w.name, damage: w.damage, damageType: w.damageType, critical: w.critical, range: w.range })),
      martialWeapons: (rulebook.martialWeapons || []).map(w => ({ id: w.id, name: w.name, damage: w.damage, damageType: w.damageType, critical: w.critical, range: w.range })),
    })
  } catch (err) {
    console.error('Failed to load wizard data:', err)
    return json<WizardLoaderData>({ races: [], classes: [], origins: [], deities: [], skills: SKILLS, generalPowers: [], tormentaPowers: [], simpleWeapons: [], martialWeapons: [] })
  }
}

// ── Wizard data → CreateCharacterInput mapper ───────────────────────────────

const ATTR_KEY_MAP: Record<string, string> = {
  FOR: 'forca', DES: 'destreza', CON: 'constituicao',
  INT: 'inteligencia', SAB: 'sabedoria', CAR: 'carisma',
}

function buildCreateInput(wizardData: Record<string, any>, pendingChoices: PendingChoice[]) {
  const resolved = pendingChoices.filter(c => c.isResolved)

  // ── Race choices ──────────────────────────────────────────────────────────
  const raceChoices: Record<string, any> = {}
  const raceAbilityChoices = resolved.filter(c =>
    c.sourceStep === 'race' && c.effectType !== 'attribute-bonus'
  )
  if (raceAbilityChoices.length > 0) {
    raceChoices.chosen_abilities = raceAbilityChoices.flatMap(c => c.selectedOptions)
  }
  const attrBonusChoices = resolved.filter(c =>
    c.sourceStep === 'race' && c.effectType === 'attribute-bonus'
  )
  if (attrBonusChoices.length > 0) {
    const bonuses: Record<string, number> = {}
    attrBonusChoices.forEach(c => {
      c.selectedOptions.forEach(opt => {
        const key = ATTR_KEY_MAP[opt] ?? opt.toLowerCase()
        bonuses[key] = 2
      })
    })
    raceChoices.chosen_attribute_bonuses = bonuses
  }

  // ── Origin choices ────────────────────────────────────────────────────────
  const originSub = resolved.filter(c => c.source.endsWith('-origem-sub'))
  const chosenSkills = originSub.find(c => c.id.endsWith('-skills'))?.selectedOptions ?? []
  const chosenPowers = originSub
    .filter(c => c.id.endsWith('-powers') || c.id.endsWith('-power'))
    .flatMap(c => c.selectedOptions)

  // ── Spells ────────────────────────────────────────────────────────────────
  const spellsChosen = resolved
    .filter(c => c.effectType === 'spell-grant')
    .flatMap(c => c.selectedOptions)

  // ── Class-specific choices ────────────────────────────────────────────────
  const classChoices: Record<string, any> = {}
  const pathChoice = resolved.find(c => c.effectType === 'caminho-do-arcanista')
  if (pathChoice) classChoices.path = pathChoice.selectedOptions[0]
  const linhagemChoice = resolved.find(c => c.effectType === 'linhagem-do-feiticeiro')
  if (linhagemChoice) classChoices.linhagem = linhagemChoice.selectedOptions[0]
  const dracoElemento = resolved.find(c => c.effectType === 'element-choice')
  if (dracoElemento) classChoices.draconico_elemento = dracoElemento.selectedOptions[0]
  const escolasChoice = resolved.find(c => c.effectType === 'escola-de-magias')
  if (escolasChoice) classChoices.escolas = escolasChoice.selectedOptions

  // ── Skill points ──────────────────────────────────────────────────────────
  const skillPoints = Object.fromEntries(
    (wizardData.trainedSkills as string[] ?? []).map(s => [s, 1])
  )

  const firstClass = (wizardData.classes as any[])?.[0]

  return {
    name: wizardData.name,
    imageUrl: wizardData.imageUrl || null,
    raceKey: wizardData.race?.id,
    raceChoices: Object.keys(raceChoices).length > 0 ? raceChoices : null,
    originKey: wizardData.origin?.id,
    originChoices: {
      chosenSkills,
      chosenPowers,
      chosenProficiencies: [],
    },
    deityKey: wizardData.deity?.id ?? null,
    sheetAttributes: Object.fromEntries(
      Object.entries(wizardData.attributes as Record<string, number>)
        .map(([k, v]) => [ATTR_KEY_MAP[k] ?? k.toLowerCase(), v])
    ),
    firstLevel: {
      classKey: firstClass?.id,
      skillPoints,
      abilitiesChosen: wizardData.selectedAbilities ?? [],
      powersChosen: wizardData.selectedPowers ?? [],
      spellsChosen,
      classChoices: Object.keys(classChoices).length > 0 ? classChoices : null,
    },
  }
}

// ── Action ──────────────────────────────────────────────────────────────────
export async function action({ request }: ActionFunctionArgs) {
  const token = await requireUserToken(request)
  const formData = await request.formData()
  const wizardDataJson = formData.get('wizardData') as string
  const pendingChoicesJson = (formData.get('pendingChoices') as string) || '[]'

  if (!wizardDataJson) {
    return json({ error: 'Dados do personagem não fornecidos' }, { status: 400 })
  }

  try {
    const wizardData = JSON.parse(wizardDataJson)
    const pendingChoices: PendingChoice[] = JSON.parse(pendingChoicesJson)
    const input = buildCreateInput(wizardData, pendingChoices)

    const result = await gqlRequest<{
      createCharacter: { character: { id: string } | null; errors: string[] | null }
    }>(CREATE_CHARACTER_MUTATION, { input }, token)

    const { character, errors } = result.data!.createCharacter
    if (errors?.length) {
      return json({ error: errors.join(', ') }, { status: 422 })
    }
    if (!character?.id) {
      return json({ error: 'Personagem não retornado pela API' }, { status: 500 })
    }

    return redirect(`/characters/${character.id}`)
  } catch (error) {
    console.error('Failed to create character:', error)
    return json({ error: 'Erro ao criar personagem' }, { status: 503 })
  }
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function CharacterNewPage() {
  const loaderData = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <WizardProvider loaderData={loaderData}>
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-10 bg-card border-b border-stroke">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="/characters"
                className="text-muted hover:text-text transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
              <h1 className="text-lg font-bold">Novo Personagem</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <CharacterCreationWizard isSubmitting={isSubmitting} />
        </main>
      </div>
    </WizardProvider>
  )
}
