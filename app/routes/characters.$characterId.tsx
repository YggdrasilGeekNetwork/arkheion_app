import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useNavigate, useRouteError, isRouteErrorResponse } from "@remix-run/react"
import { json } from "@remix-run/node"
import { useEffect } from "react"
import { CharacterProvider, useCharacter } from "~/contexts/CharacterContext"
import { ToastProvider } from "~/contexts/ToastContext"
import CharacterSheet from "~/components/game/tormenta20/CharacterSheet"
import Toast from "~/components/ui/Toast"
import OfflineWarning from "~/components/ui/OfflineWarning"
import type { Character } from "~/types/character"

export const meta: MetaFunction = () => {
  return [
    { title: "Ficha de Personagem - Arkheion" },
    { name: "description", content: "Visualize e edite sua ficha de personagem" },
  ]
}

export async function loader({ params }: LoaderFunctionArgs) {
  const characterId = params.characterId

  if (!characterId) {
    throw new Response("Character ID is required", { status: 400 })
  }

  //const result = await getCharacter(characterId)

  // MOCKED: Return mock character data
  const mockCharacter: Character = {
    id: characterId,
    name: "Thorin Escudo de Ferro",
    imageUrl: "https://via.placeholder.com/150",
    classes: [
      { name: "Guerreiro", level: 5, tooltip: "Especialista em combate corpo a corpo" },
      { name: "Paladino", level: 3, tooltip: "Guerreiro sagrado de Khalmyr" }
    ],
    origin: { name: "Humano", tooltip: "Versátil e adaptável" },
    deity: { name: "Khalmyr", tooltip: "Deus da Justiça e da Guerra" },

    health: 20,
    maxHealth: 25,
    mana: 10,
    maxMana: 15,

    attributes: [
      { label: 'FOR', value: 16, modifier: 3, visible: true },
      { label: 'DES', value: 12, modifier: 1, visible: true },
      { label: 'CON', value: 14, modifier: 2, visible: true },
      { label: 'INT', value: 10, modifier: 0, visible: true },
      { label: 'SAB', value: 13, modifier: 1, visible: true },
      { label: 'CAR', value: 15, modifier: 2, visible: true },
    ],

    resistances: [
      { value: 5, name: 'Fortitude', tooltip: 'Resistência contra venenos, doenças e efeitos físicos', visible: true },
      { value: 3, name: 'Reflexos', tooltip: 'Resistência contra ataques de área e armadilhas', visible: true },
      { value: 4, name: 'Vontade', tooltip: 'Resistência contra efeitos mentais e magias', visible: true },
    ],

    defenses: [
      { value: 18, name: 'CA', tooltip: 'Classe de Armadura' },
      { value: 16, name: 'CMD', tooltip: 'Classe de Manobra de Combate' },
    ],

    initiativeRoll: 15,
    isMyTurn: false,
    turnOrder: 1,
    availableActions: {
      standard: 1,
      movement: 1,
      free: 1,
      full: 1,
      reactions: 1,
    },

    actionsList: [
      {
        id: '1',
        name: 'Surto Heróico',
        type: 'free',
        cost: { pm: 5 },
        effect: 'Ganhe uma ação padrão ou de movimento extra',
        tooltip: 'Gaste 5 PM para ganhar uma ação adicional neste turno',
        modal: true,
        choices: ['standard', 'movement'],
        isFavorite: true,
        usesPerTurn: 1,
        usedThisTurn: 0
      },
      {
        id: '2',
        name: 'Ataque Total',
        type: 'full',
        cost: {},
        effect: 'Faça todos os seus ataques com penalidade de -2',
        tooltip: 'Usa sua ação completa para fazer múltiplos ataques',
        isFavorite: false
      },
      {
        id: '3',
        name: 'Ataque Poderoso',
        type: 'standard',
        cost: {},
        effect: 'Faça um ataque com +2 de dano e -1 de acerto',
        tooltip: 'Troque precisão por poder',
        isFavorite: true
      },
      {
        id: '4',
        name: 'Investida',
        type: 'full',
        cost: {},
        effect: 'Mova-se em linha reta e ataque com +2 de acerto',
        tooltip: 'Carga poderosa contra um inimigo',
        isFavorite: false
      },
      {
        id: '5',
        name: 'Golpe Defensivo',
        type: 'standard',
        cost: {},
        effect: 'Ataque com -4 e ganhe +2 de CA até seu próximo turno',
        tooltip: 'Ataque defensivo',
        isFavorite: false
      },
      {
        id: '6',
        name: 'Movimentação',
        type: 'movement',
        cost: {},
        effect: 'Mova-se até seu deslocamento',
        tooltip: 'Movimento básico',
        isFavorite: false
      },
      {
        id: '7',
        name: 'Chama Arcana',
        type: 'standard',
        cost: { pm: 3 },
        effect: 'Conjure chamas que causam 2d6 de dano de fogo',
        tooltip: 'Magia de fogo que atinge um alvo. Metade do dano se passar na resistência.',
        resistance: 'Reflexos CD 15',
        isFavorite: true
      },
      {
        id: '7',
        name: 'Levantar',
        type: 'movement',
        cost: {},
        effect: 'Levante-se da posição caído',
        tooltip: 'Requer uma ação de movimento',
        isFavorite: false
      },
      {
        id: '8',
        name: 'Ataque de Oportunidade',
        type: 'reaction',
        cost: {},
        effect: 'Ataque quando um inimigo sair de sua área de ameaça',
        tooltip: 'Reação automática',
        isFavorite: false
      },
      {
        id: '9',
        name: 'Poção de Cura',
        type: 'standard',
        cost: {},
        effect: 'Beba uma poção e recupere 2d8+2 PV',
        tooltip: 'Usa uma poção do inventário',
        isFavorite: true
      },
    ],

    weapons: [
      {
        id: 'weapon-1',
        name: 'Espada Longa +1',
        damage: '1d8+4',
        damageType: 'Cortante',
        attackBonus: 8,
        attackAttribute: 'FOR',
        critRange: '19-20',
        critMultiplier: 'x2',
        actionType: 'standard',
        isFavorite: true,
        favoriteOrder: 0
      },
      {
        id: 'weapon-2',
        name: 'Arco Longo',
        damage: '1d8+1',
        damageType: 'Perfurante',
        attackBonus: 5,
        attackAttribute: 'DES',
        critRange: '20',
        critMultiplier: 'x3',
        range: '30m',
        actionType: 'standard',
        isFavorite: false
      },
      {
        id: 'weapon-3',
        name: 'Adaga de Prata',
        damage: '1d4+3',
        damageType: 'Perfurante/Cortante',
        attackBonus: 6,
        attackAttribute: 'FOR',
        critRange: '19-20',
        critMultiplier: 'x2',
        actionType: 'standard',
        isFavorite: true,
        favoriteOrder: 1
      },
      {
        id: 'weapon-4',
        name: 'Martelo de Guerra',
        damage: '1d8+3',
        damageType: 'Contusão',
        attackBonus: 7,
        attackAttribute: 'FOR',
        critRange: '20',
        critMultiplier: 'x3',
        actionType: 'standard',
        isFavorite: false
      },
      {
        id: 'weapon-5',
        name: 'Lança Curta',
        damage: '1d6+3',
        damageType: 'Perfurante',
        attackBonus: 7,
        attackAttribute: 'FOR',
        critRange: '20',
        critMultiplier: 'x2',
        range: '6m',
        actionType: 'standard',
        isFavorite: false
      },
    ],

    skills: [
      { name: 'Atletismo', modifier: 8, trained: true, attribute: 'FOR', tooltip: 'Força e agilidade física', visible: true },
      { name: 'Acrobacia', modifier: 3, trained: false, attribute: 'DES', tooltip: 'Equilíbrio e agilidade', visible: false },
      { name: 'Luta', modifier: 8, trained: true, attribute: 'FOR', tooltip: 'Combate corpo a corpo', visible: true },
      { name: 'Percepção', modifier: 5, trained: true, attribute: 'SAB', tooltip: 'Notar detalhes', visible: true },
      { name: 'Intimidação', modifier: 6, trained: false, attribute: 'CAR', tooltip: 'Assustar inimigos', visible: false },
    ],

    equippedItems: {
      rightHand: { name: 'Espada Longa +1', quantity: 1, weight: 2 },
      leftHand: { name: 'Escudo de Aço +1', quantity: 1, weight: 7 },
      quickDraw1: { name: 'Poção de Cura Menor', quantity: 2, weight: 0.1 },
      quickDraw2: { name: 'Adaga de Prata', quantity: 1, weight: 0.5 },
      slot1: { name: 'Corda de Seda (15m)', quantity: 1, weight: 2.5 },
      slot2: { name: 'Tochas', quantity: 5, weight: 0.5 },
      slot3: { name: 'Kit de Primeiros Socorros', quantity: 1, weight: 1 },
      slot4: { name: 'Pederneira e Isqueiro', quantity: 1, weight: 0.1 },
    },

    backpack: [
      { name: 'Ração de Viagem', quantity: 7, weight: 0.5 },
      { name: 'Cantil de Água', quantity: 1, weight: 2 },
      { name: 'Manto de Viagem', quantity: 1, weight: 1.5 },
      { name: 'Saco de Dormir', quantity: 1, weight: 2 },
      { name: 'Flechas', quantity: 20, weight: 1.5 },
      { name: 'Óleo para Lamparina', quantity: 3, weight: 0.5 },
      { name: 'Giz', quantity: 5, weight: 0.1 },
      { name: 'Pergaminhos em Branco', quantity: 10, weight: 0.1 },
      { name: 'Símbolo Sagrado de Khalmyr', quantity: 1, weight: 0.5 },
    ],

    currencies: {
      tc: 50,
      tp: 20,
      to: 5,
    },

    updatedAt: new Date().toISOString(),
    version: 1,
  }

  return json({ character: mockCharacter })

  //return json({ character: result.data })
}

function CharacterSheetWrapper() {
  const { character: loadedCharacter } = useLoaderData<typeof loader>()
  const { dispatch } = useCharacter()
  const navigate = useNavigate()

  useEffect(() => {
    if (loadedCharacter) {
      dispatch({ type: 'SET_CHARACTER', payload: loadedCharacter })
    }
  }, [loadedCharacter, dispatch])

  const handleBackToCharacters = () => {
    navigate('/characters')
  }

  return (
    <>
      <OfflineWarning />
      <Toast />
      <CharacterSheet onBackToCharacters={handleBackToCharacters} />
    </>
  )
}

export default function CharacterPage() {
  return (
    <ToastProvider>
      <CharacterProvider>
        <CharacterSheetWrapper />
      </CharacterProvider>
    </ToastProvider>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  console.error('ErrorBoundary caught error:', error)

  if (isRouteErrorResponse(error)) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-card border border-red-600 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error.status} {error.statusText}
          </h1>
          <p className="text-muted mb-4">{error.data}</p>
          <a href="/characters" className="text-accent hover:underline">
            ← Voltar para personagens
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="bg-card border border-red-600 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
        <p className="text-muted mb-4">
          {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
        </p>
        <a href="/characters" className="text-accent hover:underline">
          ← Voltar para personagens
        </a>
      </div>
    </div>
  )
}
