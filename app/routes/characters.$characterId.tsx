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

    inCombat: false,
    initiativeRoll: null,
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
        favoriteOrder: 0,
        equipmentId: 'eq-1' // Linked to equipped Espada Longa +1
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
        isFavorite: false,
        equipmentId: 'bp-14' // Linked to Arco Longo Composto in backpack
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
        favoriteOrder: 1,
        equipmentId: 'eq-4' // Linked to Adaga de Prata in quickDraw2
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

    abilities: [
      {
        id: 'ability-1',
        name: 'Esquiva',
        description: 'Como reação, evite um ataque recebido com penalidade de -2 na CD do ataque. Pode ser usado uma vez por rodada.',
        type: 'active',
        actionType: 'reaction',
        source: 'Guerreiro',
      },
      {
        id: 'ability-2',
        name: 'Golpe Decisivo',
        description: 'Ao realizar um ataque corpo a corpo, gaste 3 PM para expandir a faixa de crítico em 1 grau naquele ataque.',
        type: 'active',
        actionType: 'standard',
        cost: { pm: 3 },
        source: 'Guerreiro 5',
      },
      {
        id: 'ability-3',
        name: 'Smite',
        description: 'Como ação livre, declare um alvo que você pode ver. Seu próximo ataque contra ele ganha +3 de acerto e +5 de dano sagrado. Se o alvo for maligno, o dano é dobrado.',
        type: 'active',
        actionType: 'free',
        source: 'Paladino',
        usesPerDay: 1,
      },
      {
        id: 'ability-4',
        name: 'Proficiência em Armas Marciais',
        description: 'Você pode usar todas as armas marciais sem penalidade de inexperiência.',
        type: 'passive',
        source: 'Guerreiro',
      },
      {
        id: 'ability-5',
        name: 'Resistência a Dano',
        description: 'Reduza o dano não-mágico que você recebe em 2 pontos por ataque.',
        type: 'passive',
        source: 'Guerreiro 3',
      },
      {
        id: 'ability-6',
        name: 'Aura de Proteção',
        description: 'Todos os aliados a até 3 metros de você ganham +2 em testes de resistência contra efeitos sagrados e maligno.',
        type: 'passive',
        source: 'Paladino',
      },
      {
        id: 'ability-7',
        name: 'Bônus de Fortitude',
        description: 'Você recebe +2 em todos os testes de resistência de Fortitude.',
        type: 'passive',
        source: 'Guerreiro',
      },
    ],

    spells: [
      {
        id: 'curar_ferimentos',
        name: 'Curar Ferimentos',
        type: 'divina',
        circle: 1,
        school: 'evoc',
        execution: 'padrão',
        range: 'toque',
        target: { type: 'uma criatura' },
        duration: 'instantânea',
        description: 'Você canaliza energia positiva que cura 2d8+2 pontos de vida na criatura tocada. Como alternativa, você pode usar esta magia para causar a mesma quantidade de dano de luz a uma criatura morta-viva (Vontade reduz à metade).',
        resistance: 'Vontade parcial',
        enhancements: [
          { cost: 1, type: 'aumenta', description: 'Aumenta a cura em +1d8+1.' },
          { cost: 2, type: 'muda', description: 'Muda o alcance para curto e o alvo para até 3 criaturas.' },
        ],
      },
      {
        id: 'escudo_da_fe',
        name: 'Escudo da Fé',
        type: 'divina',
        circle: 1,
        school: 'abjur',
        execution: 'padrão',
        range: 'pessoal',
        target: { type: 'você' },
        duration: 'cena',
        description: 'Esta magia cria uma película protetora invisível, mas tangível, fornecendo +2 na Defesa.',
        enhancements: [
          { cost: 1, type: 'muda', description: 'Muda a execução para reação. Fornece +4 na Defesa contra o próximo ataque até o fim do turno.' },
          { cost: 2, type: 'aumenta', description: 'Aumenta o bônus na Defesa em +1.' },
        ],
        effects: [{ type: 'bônus', attribute: 'ca', amount: '+2' }],
      },
      {
        id: 'luz',
        name: 'Luz',
        type: 'divina',
        circle: 1,
        school: 'evoc',
        execution: 'padrão',
        range: 'curto',
        target: { type: 'um objeto' },
        duration: 'cena',
        description: 'O alvo emite luz em um raio de 6m. O objeto pode ser guardado para "desligar" a luz.',
        enhancements: [
          { cost: 1, type: 'aumenta', description: 'Aumenta a área da iluminação em +3m de raio.' },
          { cost: 2, type: 'muda', description: 'Muda a duração para 1 dia e o alcance para toque.' },
        ],
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
      rightHand: { id: 'eq-1', name: 'Espada Longa +1', quantity: 1, weight: 2, spaces: 1, price: 15, category: 'weapon', description: 'Espada longa de aço com encantamento +1' },
      leftHand: { id: 'eq-2', name: 'Escudo de Aço +1', quantity: 1, weight: 7, spaces: 1, price: 15, category: 'armor', description: 'Escudo pesado de aço reforçado' },
      quickDraw1: { id: 'eq-3', name: 'Poção de Cura Menor', quantity: 2, weight: 0.1, spaces: 0.5, price: 50, category: 'alchemical', description: 'Restaura 2d8+2 PV' },
      quickDraw2: { id: 'eq-4', name: 'Adaga de Prata', quantity: 1, weight: 0.5, spaces: 1, price: 2, category: 'weapon', description: 'Adaga leve de prata, efetiva contra mortos-vivos' },
      slot1: { id: 'eq-5', name: 'Corda de Seda (15m)', quantity: 1, weight: 2.5, spaces: 1, price: 10, category: 'equipment', description: 'Corda resistente de seda, 15 metros' },
      slot2: { id: 'eq-6', name: 'Tochas', quantity: 5, weight: 0.5, spaces: 1, price: 0.1, category: 'equipment', description: 'Tochas para iluminação, 5 unidades' },
      slot3: { id: 'eq-7', name: 'Kit de Primeiros Socorros', quantity: 1, weight: 1, spaces: 1, price: 50, category: 'tool', description: 'Maleta de medicamentos com ervas e bandagens' },
      slot4: { id: 'eq-8', name: 'Pederneira e Isqueiro', quantity: 1, weight: 0.1, spaces: 1, price: 1, category: 'equipment', description: 'Para fazer fogo' },
    },

    backpack: [
      { id: 'bp-1', name: 'Ração de Viagem', quantity: 7, weight: 0.5, spaces: 0.5, price: 0.5, category: 'food', description: 'Ração seca para viagem, 1 dia de comida' },
      { id: 'bp-2', name: 'Cantil de Água', quantity: 1, weight: 2, spaces: 1, price: 1, category: 'equipment', description: 'Cantil de couro com água fresca' },
      { id: 'bp-3', name: 'Manto de Viagem', quantity: 1, weight: 1.5, spaces: 1, price: 10, category: 'clothing', description: 'Manto de lã com capuz para proteção contra clima' },
      { id: 'bp-4', name: 'Saco de Dormir', quantity: 1, weight: 2, spaces: 1, price: 1, category: 'equipment', description: 'Colchão enrolável com coberta' },
      { id: 'bp-5', name: 'Flechas', quantity: 20, weight: 1.5, spaces: 1, price: 1, category: 'weapon', description: 'Aljava com 20 flechas' },
      { id: 'bp-6', name: 'Óleo para Lamparina', quantity: 3, weight: 0.5, spaces: 0.5, price: 0.1, category: 'equipment', description: 'Frasco de óleo inflamável, 3 doses' },
      { id: 'bp-7', name: 'Giz', quantity: 5, weight: 0.1, spaces: 0.5, price: 0.1, category: 'equipment', description: 'Giz para marcar caminhos' },
      { id: 'bp-8', name: 'Pergaminhos em Branco', quantity: 10, weight: 0.1, spaces: 0.5, price: 1, category: 'equipment', description: 'Pergaminhos vazios para escrita' },
      { id: 'bp-9', name: 'Símbolo Sagrado de Khalmyr', quantity: 1, weight: 0.5, spaces: 1, price: 5, category: 'esoteric', description: 'Medalhão sagrado de Khalmyr, +1 em testes de resistência' },
      { id: 'bp-10', name: 'Poção de Cura', quantity: 3, weight: 0.5, spaces: 0.5, price: 50, category: 'alchemical', description: 'Poção de cura básica feita por um boticário de confiança', effects: [{ id: 'eff-cure', name: 'Cura Básica', description: 'Restaura 2d8+2 PV', type: 'consumable', activeAbility: { name: 'Beber Poção', description: 'Restaura pontos de vida', actionType: 'standard' } }] },
      { id: 'bp-11', name: 'Elixir de Força', quantity: 2, weight: 0.3, spaces: 0.5, price: 80, category: 'alchemical', description: 'Elixir alquímico que aprimoa a força física do portador', effects: [{ id: 'eff-str', name: 'Força Aprimorada', description: '+2 no modificador de FOR', type: 'consumable', passiveModifiers: { attribute: { label: 'FOR', bonus: 2 } }, activeAbility: { name: 'Ingerir Elixir', description: 'Aumenta FOR em +2', actionType: 'free' } }] },
      { id: 'bp-12', name: 'Bomba de Fumaça', quantity: 2, weight: 0.3, spaces: 0.5, price: 25, category: 'alchemical', description: 'Dispositivo explosivo que libera uma densa nuvem de fumaça', effects: [{ id: 'eff-smoke', name: 'Nuvem de Fumaça', description: 'Cria nuvem de fumaça em raio de 3m por 1 rodada', type: 'consumable', activeAbility: { name: 'Lançar Bomba', description: 'Cria nuvem de fumaça', actionType: 'standard' } }] },
      { id: 'bp-13', name: 'Montante', quantity: 1, weight: 4, spaces: 2, price: 50, category: 'weapon', description: 'Espada gigante de duas mãos. Dano 2d6+FOR, crítico 19-20/x2.', twoHanded: true },
      { id: 'bp-14', name: 'Arco Longo Composto', quantity: 1, weight: 1.5, spaces: 1, price: 100, category: 'weapon', description: 'Arco longo reforçado que requer duas mãos para usar. Dano 1d8+FOR, crítico x3, alcance 30m.', twoHanded: true },
      { id: 'bp-15', name: 'Espada Bastarda', quantity: 1, weight: 3, spaces: 1, price: 35, category: 'weapon', description: 'Espada versátil que pode ser usada com uma ou duas mãos. Uma mão: 1d10+FOR. Duas mãos: 1d10+FOR×1.5 (+2 dano). Crítico 19-20/x2.', versatile: true },
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
