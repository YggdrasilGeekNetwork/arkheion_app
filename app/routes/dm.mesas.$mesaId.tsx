import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { json } from "@remix-run/node"
import { useEffect } from "react"
import { MesaProvider, useMesa } from "~/contexts/MesaContext"
import { ToastProvider } from "~/contexts/ToastContext"
import { SocketProvider } from "~/contexts/SocketContext"
import DMDashboard from "~/components/dm/DMDashboard"
import type { MesaWithCharacters } from "~/types/mesa"
import type { Character } from "~/types/character"

export const meta: MetaFunction = () => {
  return [
    { title: "Mesa do Mestre - Arkheion" },
    { name: "description", content: "Dashboard do Mestre com visão geral dos personagens" },
  ]
}

// Mock character template for reuse
const createMockCharacter = (overrides: Partial<Character> & { id: string; name: string }): Character => ({
  id: overrides.id,
  name: overrides.name,
  imageUrl: overrides.imageUrl,
  classes: overrides.classes || [{ name: "Guerreiro", level: 1 }],
  origin: overrides.origin || { name: "Humano" },
  deity: overrides.deity,
  health: overrides.health ?? 20,
  maxHealth: overrides.maxHealth ?? 25,
  mana: overrides.mana ?? 10,
  maxMana: overrides.maxMana ?? 15,
  attributes: overrides.attributes || [
    { label: 'FOR', value: 14, modifier: 2, visible: true },
    { label: 'DES', value: 12, modifier: 1, visible: true },
    { label: 'CON', value: 14, modifier: 2, visible: true },
    { label: 'INT', value: 10, modifier: 0, visible: true },
    { label: 'SAB', value: 12, modifier: 1, visible: true },
    { label: 'CAR', value: 10, modifier: 0, visible: true },
  ],
  resistances: overrides.resistances || [
    { value: 5, name: 'Fortitude', tooltip: '', visible: true },
    { value: 3, name: 'Reflexos', tooltip: '', visible: true },
    { value: 4, name: 'Vontade', tooltip: '', visible: true },
  ],
  defenses: overrides.defenses || [
    { value: 16, name: 'CA', tooltip: '' },
  ],
  inCombat: false,
  initiativeRoll: null,
  isMyTurn: false,
  turnOrder: 1,
  availableActions: { standard: 1, movement: 1, free: 1, full: 1, reaction: 1 },
  actionsList: [],
  weapons: [],
  skills: overrides.skills || [
    { name: 'Percepção', modifier: 5, trained: true, attribute: 'SAB', visibleInSummary: true },
    { name: 'Atletismo', modifier: 6, trained: true, attribute: 'FOR', visibleInSummary: true },
  ],
  equippedItems: {
    rightHand: null,
    leftHand: null,
    quickDraw1: null,
    quickDraw2: null,
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
  },
  backpack: [],
  currencies: { tc: 0, tp: 0, to: 0 },
  updatedAt: new Date().toISOString(),
  version: 1,
})

export async function loader({ params }: LoaderFunctionArgs) {
  const mesaId = params.mesaId

  if (!mesaId) {
    throw new Response("Mesa ID is required", { status: 400 })
  }

  // MOCKED: Return mock mesa data with characters
  const mockMesa: MesaWithCharacters = {
    id: mesaId,
    name: "A Maldição do Castelo Sombrio",
    description: "Uma aventura sombria nas terras do norte",
    dmId: "dm-user-1",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    characters: [
      createMockCharacter({
        id: "1",
        name: "Thorin Escudo de Ferro",
        imageUrl: "https://via.placeholder.com/150",
        classes: [
          { name: "Guerreiro", level: 5 },
          { name: "Paladino", level: 3 }
        ],
        deity: { name: "Khalmyr" },
        health: 45,
        maxHealth: 68,
        mana: 12,
        maxMana: 24,
        attributes: [
          { label: 'FOR', value: 18, modifier: 4, visible: true },
          { label: 'DES', value: 12, modifier: 1, visible: true },
          { label: 'CON', value: 16, modifier: 3, visible: true },
          { label: 'INT', value: 10, modifier: 0, visible: true },
          { label: 'SAB', value: 14, modifier: 2, visible: true },
          { label: 'CAR', value: 13, modifier: 1, visible: true },
        ],
        resistances: [
          { value: 9, name: 'Fortitude', tooltip: '', visible: true },
          { value: 5, name: 'Reflexos', tooltip: '', visible: true },
          { value: 7, name: 'Vontade', tooltip: '', visible: true },
        ],
        defenses: [
          { value: 20, name: 'CA', tooltip: 'Armadura completa + escudo' },
        ],
        skills: [
          { name: 'Luta', modifier: 12, trained: true, attribute: 'FOR', visibleInSummary: true },
          { name: 'Atletismo', modifier: 10, trained: true, attribute: 'FOR', visibleInSummary: true },
          { name: 'Intimidação', modifier: 7, trained: true, attribute: 'CAR', visibleInSummary: true },
        ],
      }),
      createMockCharacter({
        id: "2",
        name: "Lyra Sombravento",
        imageUrl: "https://via.placeholder.com/150",
        classes: [{ name: "Ladino", level: 7 }],
        origin: { name: "Elfa" },
        health: 28,
        maxHealth: 42,
        mana: 8,
        maxMana: 14,
        attributes: [
          { label: 'FOR', value: 10, modifier: 0, visible: true },
          { label: 'DES', value: 20, modifier: 5, visible: true },
          { label: 'CON', value: 12, modifier: 1, visible: true },
          { label: 'INT', value: 14, modifier: 2, visible: true },
          { label: 'SAB', value: 12, modifier: 1, visible: true },
          { label: 'CAR', value: 16, modifier: 3, visible: true },
        ],
        resistances: [
          { value: 4, name: 'Fortitude', tooltip: '', visible: true },
          { value: 11, name: 'Reflexos', tooltip: '', visible: true },
          { value: 5, name: 'Vontade', tooltip: '', visible: true },
        ],
        defenses: [
          { value: 17, name: 'CA', tooltip: 'Armadura de couro +1' },
        ],
        skills: [
          { name: 'Furtividade', modifier: 15, trained: true, attribute: 'DES', visibleInSummary: true },
          { name: 'Acrobacia', modifier: 12, trained: true, attribute: 'DES', visibleInSummary: true },
          { name: 'Ladinagem', modifier: 14, trained: true, attribute: 'DES', visibleInSummary: true },
        ],
      }),
      createMockCharacter({
        id: "3",
        name: "Alaric Flamejante",
        imageUrl: "https://via.placeholder.com/150",
        classes: [{ name: "Mago", level: 6 }, { name: "Arcanista", level: 2 }],
        origin: { name: "Humano" },
        deity: { name: "Wynna" },
        health: 18,
        maxHealth: 32,
        mana: 45,
        maxMana: 56,
        attributes: [
          { label: 'FOR', value: 8, modifier: -1, visible: true },
          { label: 'DES', value: 14, modifier: 2, visible: true },
          { label: 'CON', value: 12, modifier: 1, visible: true },
          { label: 'INT', value: 20, modifier: 5, visible: true },
          { label: 'SAB', value: 14, modifier: 2, visible: true },
          { label: 'CAR', value: 10, modifier: 0, visible: true },
        ],
        resistances: [
          { value: 4, name: 'Fortitude', tooltip: '', visible: true },
          { value: 6, name: 'Reflexos', tooltip: '', visible: true },
          { value: 8, name: 'Vontade', tooltip: '', visible: true },
        ],
        defenses: [
          { value: 14, name: 'CA', tooltip: 'Manto arcano' },
        ],
        skills: [
          { name: 'Conhecimento (Arcano)', modifier: 14, trained: true, attribute: 'INT', visibleInSummary: true },
          { name: 'Identificar Magia', modifier: 13, trained: true, attribute: 'INT', visibleInSummary: true },
        ],
      }),
      createMockCharacter({
        id: "4",
        name: "Seraphina Luz Divina",
        imageUrl: "https://via.placeholder.com/150",
        classes: [{ name: "Clérigo", level: 8 }],
        origin: { name: "Anã" },
        deity: { name: "Lena" },
        health: 52,
        maxHealth: 58,
        mana: 38,
        maxMana: 48,
        attributes: [
          { label: 'FOR', value: 14, modifier: 2, visible: true },
          { label: 'DES', value: 10, modifier: 0, visible: true },
          { label: 'CON', value: 16, modifier: 3, visible: true },
          { label: 'INT', value: 12, modifier: 1, visible: true },
          { label: 'SAB', value: 18, modifier: 4, visible: true },
          { label: 'CAR', value: 14, modifier: 2, visible: true },
        ],
        resistances: [
          { value: 9, name: 'Fortitude', tooltip: '', visible: true },
          { value: 4, name: 'Reflexos', tooltip: '', visible: true },
          { value: 10, name: 'Vontade', tooltip: '', visible: true },
        ],
        defenses: [
          { value: 18, name: 'CA', tooltip: 'Armadura de escamas + escudo' },
        ],
        skills: [
          { name: 'Cura', modifier: 14, trained: true, attribute: 'SAB', visibleInSummary: true },
          { name: 'Religião', modifier: 12, trained: true, attribute: 'SAB', visibleInSummary: true },
          { name: 'Diplomacia', modifier: 10, trained: true, attribute: 'CAR', visibleInSummary: true },
        ],
      }),
    ],
  }

  return json({ mesa: mockMesa })
}

function DMDashboardWrapper() {
  const { mesa } = useLoaderData<typeof loader>()
  const { dispatch } = useMesa()
  const navigate = useNavigate()

  useEffect(() => {
    if (mesa) {
      dispatch({ type: 'SET_MESA', payload: mesa as MesaWithCharacters })
    }
  }, [mesa, dispatch])

  return <DMDashboard onBack={() => navigate('/dm/mesas')} />
}

export default function MesaPage() {
  const { mesa } = useLoaderData<typeof loader>()

  return (
    <ToastProvider>
      <SocketProvider mesaId={mesa.id}>
        <MesaProvider>
          <DMDashboardWrapper />
        </MesaProvider>
      </SocketProvider>
    </ToastProvider>
  )
}
