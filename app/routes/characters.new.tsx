import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { requireUserToken } from '~/utils/session.server'
import { useLoaderData, useNavigation } from '@remix-run/react'
import { WizardProvider } from '~/contexts/WizardContext'
import CharacterCreationWizard from '~/components/wizard/CharacterCreationWizard'
import type { WizardLoaderData, RaceData, ClassData, DeityData, OriginData } from '~/types/wizard'
import { gqlRequest } from '~/utils/graphql.server'
import { WIZARD_DATA_QUERY } from '~/graphql/characters'

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
type ApiPoder = { id: string; name: string; description?: string; effects?: unknown }

type ApiRaca = {
  id: string; name: string; description?: string
  size?: string; movement?: number
  attributeBonuses?: Record<string, number>
  racialAbilities?: string[]
}

type ApiClasse = {
  id: string; name: string; description?: string
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
}

type ApiOrigem = {
  id: string; name: string; description?: string
  benefits?: { skills?: string[]; powers?: string[]; special?: string }
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
  }
}

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
  return racas.map(r => ({
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
  }))
}

function transformClasses(classes: ApiClasse[], index: Map<string, ApiPoder>): ClassData[] {
  return classes.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
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
      return { id, name: p?.name || id, description: p?.description }
    }),
  }))
}

function transformOrigins(origens: ApiOrigem[]): OriginData[] {
  return origens.map(o => ({
    id: o.id,
    name: o.name,
    description: o.description || '',
    skills: o.benefits?.skills || [],
    powers: o.benefits?.powers || [],
    specialNote: o.benefits?.special,
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

    return json<WizardLoaderData>({
      races: transformRaces(rulebook.racas, powersIndex),
      classes: transformClasses(rulebook.classes, powersIndex),
      origins: transformOrigins(rulebook.origens),
      deities: transformDeities(rulebook.divindades, powersIndex),
      skills: SKILLS,
    })
  } catch (err) {
    console.error('Failed to load wizard data:', err)
    return json<WizardLoaderData>({ races: [], classes: [], origins: [], deities: [], skills: SKILLS })
  }
}

// ── Action ──────────────────────────────────────────────────────────────────
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const wizardDataJson = formData.get('wizardData') as string

  if (!wizardDataJson) {
    return json({ error: 'Dados do personagem não fornecidos' }, { status: 400 })
  }

  try {
    const _wizardData = JSON.parse(wizardDataJson)
    // TODO: Call createCharacter API
    const mockId = `char-${Date.now()}`
    return redirect(`/characters/${mockId}`)
  } catch (error) {
    console.error('Failed to create character:', error)
    return json({ error: 'Erro ao criar personagem' }, { status: 500 })
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
