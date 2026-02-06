import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigation, Form } from '@remix-run/react'
import { WizardProvider } from '~/contexts/WizardContext'
import CharacterCreationWizard from '~/components/wizard/CharacterCreationWizard'
import type { WizardLoaderData, RaceData, ClassData, DeityData, OriginData } from '~/types/wizard'

// Mock data for races
const mockRaces: RaceData[] = [
  {
    id: 'humano',
    name: 'Humano',
    description: 'Humanos são versáteis e adaptáveis, encontrados em todas as partes de Arton.',
    attributeBonuses: [], // Humano escolhe 3 atributos para +1
    abilities: [
      {
        id: 'versatil',
        name: 'Versátil',
        description: 'Você recebe +1 em três atributos diferentes à sua escolha.',
        type: 'passive',
      },
      {
        id: 'bonus-pericia',
        name: 'Bônus de Perícia',
        description: 'Você recebe 2 perícias treinadas adicionais à sua escolha.',
        type: 'passive',
      },
    ],
    choices: [
      {
        id: 'versatil-atributos',
        title: 'Versátil',
        description: 'Escolha três atributos para receber +1',
        type: 'multiple',
        minSelections: 3,
        maxSelections: 3,
        options: [
          { id: 'for', name: 'Força', effects: { attributeBonus: { attribute: 'FOR', value: 1 } } },
          { id: 'des', name: 'Destreza', effects: { attributeBonus: { attribute: 'DES', value: 1 } } },
          { id: 'con', name: 'Constituição', effects: { attributeBonus: { attribute: 'CON', value: 1 } } },
          { id: 'int', name: 'Inteligência', effects: { attributeBonus: { attribute: 'INT', value: 1 } } },
          { id: 'sab', name: 'Sabedoria', effects: { attributeBonus: { attribute: 'SAB', value: 1 } } },
          { id: 'car', name: 'Carisma', effects: { attributeBonus: { attribute: 'CAR', value: 1 } } },
        ],
        targetStep: 'race',
      },
    ],
    size: 'Médio',
    speed: 9,
  },
  {
    id: 'anao',
    name: 'Anão',
    description: 'Anões são resistentes e tradicionais, mestres da forja e da mineração.',
    attributeBonuses: [
      { attribute: 'CON', value: 2 },
      { attribute: 'SAB', value: 1 },
    ],
    abilities: [
      {
        id: 'visao-escuro',
        name: 'Visão no Escuro',
        description: 'Você enxerga no escuro a até 18m.',
        type: 'passive',
      },
      {
        id: 'conhecimento-rochas',
        name: 'Conhecimento das Rochas',
        description: '+2 em testes de Percepção e Investigação relacionados a rochas ou construções.',
        type: 'passive',
      },
      {
        id: 'duro-matar',
        name: 'Duro de Matar',
        description: 'Você recebe +2 PV por nível.',
        type: 'passive',
      },
    ],
    size: 'Médio',
    speed: 6,
  },
  {
    id: 'elfo',
    name: 'Elfo',
    description: 'Elfos são graciosos e longevos, com afinidade natural para magia.',
    attributeBonuses: [
      { attribute: 'DES', value: 2 },
      { attribute: 'INT', value: 1 },
    ],
    abilities: [
      {
        id: 'visao-escuro',
        name: 'Visão no Escuro',
        description: 'Você enxerga no escuro a até 18m.',
        type: 'passive',
      },
      {
        id: 'sentidos-elficos',
        name: 'Sentidos Élficos',
        description: '+2 em Percepção. Você não pode ser surpreendido.',
        type: 'passive',
      },
    ],
    size: 'Médio',
    speed: 9,
  },
  {
    id: 'goblin',
    name: 'Goblin',
    description: 'Goblins são pequenos, astutos e surpreendentemente resistentes.',
    attributeBonuses: [
      { attribute: 'DES', value: 2 },
      { attribute: 'INT', value: 1 },
    ],
    abilities: [
      {
        id: 'visao-escuro',
        name: 'Visão no Escuro',
        description: 'Você enxerga no escuro a até 18m.',
        type: 'passive',
      },
      {
        id: 'engenhoso',
        name: 'Engenhoso',
        description: '+2 em Ofício e você pode criar engenhocas.',
        type: 'passive',
      },
      {
        id: 'pequeno',
        name: 'Pequeno',
        description: 'Você ocupa um quadrado de 1,5m e pode se esconder atrás de criaturas médias.',
        type: 'passive',
      },
    ],
    size: 'Pequeno',
    speed: 6,
  },
]

// Mock data for classes
const mockClasses: ClassData[] = [
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    description: 'Mestres do combate, especializados em armas e táticas de batalha.',
    hitDie: 10,
    primaryAttributes: ['FOR', 'CON'],
    savingThrows: ['Fortitude'],
    skillChoices: {
      count: 4,
      options: ['Atletismo', 'Cavalgar', 'Intimidação', 'Luta', 'Ofício', 'Percepção', 'Pontaria', 'Fortitude'],
    },
    proficiencies: {
      armor: ['Leve', 'Pesada', 'Escudo'],
      weapons: ['Simples', 'Marciais'],
      tools: [],
    },
    abilities: [
      {
        id: 'ataque-especial',
        name: 'Ataque Especial',
        description: 'Uma vez por rodada, você pode gastar 1 PM para adicionar +1d8 ao dano de um ataque.',
        type: 'active',
        level: 1,
      },
      {
        id: 'dureza',
        name: 'Dureza',
        description: 'Você recebe +2 em Defesa.',
        type: 'passive',
        level: 1,
      },
    ],
    manaPerLevel: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  },
  {
    id: 'arcanista',
    name: 'Arcanista',
    description: 'Estudiosos da magia arcana, capazes de lançar poderosos feitiços.',
    hitDie: 6,
    primaryAttributes: ['INT'],
    savingThrows: ['Vontade'],
    skillChoices: {
      count: 4,
      options: ['Conhecimento', 'Diplomacia', 'Enganação', 'Iniciativa', 'Intuição', 'Investigação', 'Misticismo', 'Ofício', 'Vontade'],
    },
    proficiencies: {
      armor: [],
      weapons: ['Simples'],
      tools: [],
    },
    abilities: [
      {
        id: 'magia-arcana',
        name: 'Magia Arcana',
        description: 'Você pode lançar magias arcanas. Seu atributo-chave é Inteligência.',
        type: 'passive',
        level: 1,
      },
    ],
    spellcasting: {
      attribute: 'INT',
      type: 'arcana',
      knownSpellsPerLevel: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    manaPerLevel: [4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 30],
  },
  {
    id: 'clerigo',
    name: 'Clérigo',
    description: 'Servos divinos que canalizam o poder de seus deuses.',
    hitDie: 8,
    primaryAttributes: ['SAB', 'CAR'],
    savingThrows: ['Vontade'],
    skillChoices: {
      count: 4,
      options: ['Conhecimento', 'Cura', 'Diplomacia', 'Intuição', 'Misticismo', 'Ofício', 'Percepção', 'Religião', 'Vontade'],
    },
    proficiencies: {
      armor: ['Leve', 'Pesada', 'Escudo'],
      weapons: ['Simples'],
      tools: [],
    },
    abilities: [
      {
        id: 'magia-divina',
        name: 'Magia Divina',
        description: 'Você pode lançar magias divinas. Seu atributo-chave é Sabedoria.',
        type: 'passive',
        level: 1,
      },
      {
        id: 'poder-divino',
        name: 'Poder Divino',
        description: 'Você recebe um poder concedido por sua divindade.',
        type: 'passive',
        level: 1,
      },
    ],
    spellcasting: {
      attribute: 'SAB',
      type: 'divina',
      knownSpellsPerLevel: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    manaPerLevel: [3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 20, 21, 23, 24, 25, 27, 28],
  },
  {
    id: 'ladino',
    name: 'Ladino',
    description: 'Especialistas em furtividade, armadilhas e ataques precisos.',
    hitDie: 8,
    primaryAttributes: ['DES'],
    savingThrows: ['Reflexos'],
    skillChoices: {
      count: 8,
      options: ['Acrobacia', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade', 'Iniciativa', 'Intimidação', 'Intuição', 'Investigação', 'Ladinagem', 'Percepção', 'Pontaria', 'Reflexos'],
    },
    proficiencies: {
      armor: ['Leve'],
      weapons: ['Simples', 'Armas de Precisão'],
      tools: ['Ferramentas de Ladrão'],
    },
    abilities: [
      {
        id: 'ataque-furtivo',
        name: 'Ataque Furtivo',
        description: 'Uma vez por rodada, quando ataca um inimigo desprevenido ou flanqueado, você causa +1d6 de dano.',
        type: 'passive',
        level: 1,
      },
      {
        id: 'evasao',
        name: 'Evasão',
        description: 'Quando faz um teste de Reflexos para reduzir o dano pela metade, se passar você não sofre dano.',
        type: 'passive',
        level: 1,
      },
    ],
    manaPerLevel: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  },
]

// Mock data for deities
const mockDeities: DeityData[] = [
  {
    id: 'khalmyr',
    name: 'Khalmyr',
    description: 'Deus da justiça, da honra e do dever.',
    alignment: 'Leal e Bom',
    domains: ['Guerra', 'Proteção'],
    values: 'Justiça, honra, dever, proteção dos inocentes, cumprimento de promessas.',
    energy: 'positiva',
    favoriteWeapon: 'Espada longa',
    obligations: [
      'Nunca mentir ou trapacear.',
      'Sempre cumprir sua palavra.',
      'Proteger os inocentes e punir os culpados.',
    ],
    restrictions: [
      'Nunca fugir de um combate justo.',
      'Nunca usar venenos ou armadilhas traiçoeiras.',
    ],
    powers: [
      {
        id: 'coragem-total',
        name: 'Coragem Total',
        description: 'Você é imune a medo.',
        type: 'passive',
      },
      {
        id: 'golpe-justiceiro',
        name: 'Golpe Justiceiro',
        description: 'Você pode gastar 2 PM para causar +2d6 de dano em um ataque contra um inimigo que tenha ferido um aliado.',
        type: 'active',
        actionType: 'livre',
        cost: { pm: 2 },
      },
      {
        id: 'aura-ordem',
        name: 'Aura da Ordem',
        description: 'Você e aliados em alcance curto recebem +2 em testes de resistência contra efeitos de caos.',
        type: 'passive',
      },
    ],
  },
  {
    id: 'valkaria',
    name: 'Valkaria',
    description: 'Deusa da ambição, da liberdade e da humanidade.',
    alignment: 'Neutro e Bom',
    domains: ['Glória', 'Proteção'],
    values: 'Ambição, coragem, liberdade, superação de limites, humanidade.',
    energy: 'positiva',
    favoriteWeapon: 'Lança',
    obligations: [
      'Nunca aceitar limites impostos por outros.',
      'Sempre buscar superar seus próprios limites.',
      'Proteger a liberdade dos outros.',
    ],
    restrictions: [
      'Nunca aceitar a escravidão ou servidão.',
      'Nunca desistir de um objetivo por medo.',
    ],
    powers: [
      {
        id: 'aura-coragem',
        name: 'Aura da Coragem',
        description: 'Você e aliados em alcance curto recebem +2 em testes contra medo.',
        type: 'passive',
      },
      {
        id: 'superacao',
        name: 'Superação',
        description: 'Uma vez por cena, quando falhar em um teste, você pode gastar 2 PM para rolar novamente.',
        type: 'active',
        actionType: 'reação',
        cost: { pm: 2 },
      },
      {
        id: 'gloria-heroi',
        name: 'Glória do Herói',
        description: 'Quando reduz um inimigo a 0 PV, você recupera 1d6 PM.',
        type: 'passive',
      },
    ],
  },
  {
    id: 'arsenal',
    name: 'Arsenal',
    description: 'Deus da guerra e das batalhas.',
    alignment: 'Neutro',
    domains: ['Guerra', 'Força'],
    values: 'Combate, força, táticas de guerra, vitória, honra marcial.',
    energy: 'positiva',
    favoriteWeapon: 'Machado de batalha',
    obligations: [
      'Nunca recusar um desafio de combate.',
      'Respeitar oponentes valorosos.',
      'Buscar sempre a vitória em batalha.',
    ],
    restrictions: [
      'Nunca atacar inimigos desarmados que se rendam.',
      'Nunca usar táticas covardes.',
    ],
    powers: [
      {
        id: 'ataque-poderoso',
        name: 'Ataque Poderoso',
        description: 'Você pode gastar 1 PM para causar +1d6 de dano em um ataque corpo a corpo.',
        type: 'active',
        actionType: 'livre',
        cost: { pm: 1 },
      },
      {
        id: 'furia-batalha',
        name: 'Fúria de Batalha',
        description: 'Quando sofre dano, você recebe +1 em ataques até o fim da cena. Cumulativo.',
        type: 'passive',
      },
      {
        id: 'resistencia-marcial',
        name: 'Resistência Marcial',
        description: 'Você recebe resistência a dano 2.',
        type: 'passive',
      },
    ],
  },
  {
    id: 'nimb',
    name: 'Nimb',
    description: 'Deus do caos e da sorte.',
    alignment: 'Caótico e Neutro',
    domains: ['Caos', 'Sorte'],
    values: 'Caos, sorte, imprevisibilidade, diversão, mudança.',
    energy: 'positiva',
    favoriteWeapon: 'Adaga',
    obligations: [
      'Nunca seguir um plano rígido.',
      'Sempre abraçar o inesperado.',
      'Trazer diversão e caos aonde for.',
    ],
    restrictions: [
      'Nunca ser previsível ou rotineiro.',
      'Nunca impedir a mudança.',
    ],
    powers: [
      {
        id: 'sorte-nimb',
        name: 'Sorte de Nimb',
        description: 'Uma vez por cena, você pode rolar novamente um d20.',
        type: 'active',
        actionType: 'reação',
      },
      {
        id: 'aura-caos',
        name: 'Aura do Caos',
        description: 'Inimigos em alcance curto sofrem -2 em testes de resistência contra suas magias.',
        type: 'passive',
      },
      {
        id: 'benção-imprevisivel',
        name: 'Bênção Imprevisível',
        description: 'No início de cada cena, role 1d6: 1-2 receba +2 em Defesa, 3-4 receba +2 em ataques, 5-6 receba +2 em testes.',
        type: 'passive',
      },
    ],
  },
]

// Mock data for origins
const mockOrigins: OriginData[] = [
  {
    id: 'soldado',
    name: 'Soldado',
    description: 'Você serviu em um exército ou milícia.',
    skillBonuses: [
      { skill: 'Luta', value: 2 },
      { skill: 'Intimidação', value: 2 },
    ],
    startingGold: 50,
  },
  {
    id: 'criminoso',
    name: 'Criminoso',
    description: 'Você viveu fora da lei.',
    skillBonuses: [
      { skill: 'Furtividade', value: 2 },
      { skill: 'Ladinagem', value: 2 },
    ],
    startingGold: 30,
  },
  {
    id: 'academico',
    name: 'Acadêmico',
    description: 'Você estudou em uma instituição de ensino.',
    skillBonuses: [
      { skill: 'Conhecimento', value: 2 },
      { skill: 'Investigação', value: 2 },
    ],
    startingGold: 40,
  },
  {
    id: 'acolito',
    name: 'Acólito',
    description: 'Você serviu em um templo.',
    skillBonuses: [
      { skill: 'Religião', value: 2 },
      { skill: 'Cura', value: 2 },
    ],
    startingGold: 25,
  },
]

// Mock skills list
const mockSkills = [
  { name: 'Acrobacia', attribute: 'DES', description: 'Equilíbrio, cambalhotas e quedas.' },
  { name: 'Adestramento', attribute: 'CAR', description: 'Treinar e comandar animais.' },
  { name: 'Atletismo', attribute: 'FOR', description: 'Escalar, nadar, saltar.' },
  { name: 'Atuação', attribute: 'CAR', description: 'Representação e entretenimento.' },
  { name: 'Cavalgar', attribute: 'DES', description: 'Montar e controlar montarias.' },
  { name: 'Conhecimento', attribute: 'INT', description: 'Saber geral e erudição.' },
  { name: 'Cura', attribute: 'SAB', description: 'Tratamento de ferimentos e doenças.' },
  { name: 'Diplomacia', attribute: 'CAR', description: 'Negociação e convencimento.' },
  { name: 'Enganação', attribute: 'CAR', description: 'Mentiras e disfarces.' },
  { name: 'Fortitude', attribute: 'CON', description: 'Resistência física.' },
  { name: 'Furtividade', attribute: 'DES', description: 'Esgueirar-se e esconder-se.' },
  { name: 'Guerra', attribute: 'INT', description: 'Táticas e estratégias militares.' },
  { name: 'Iniciativa', attribute: 'DES', description: 'Velocidade de reação.' },
  { name: 'Intimidação', attribute: 'CAR', description: 'Coagir e amedrontar.' },
  { name: 'Intuição', attribute: 'SAB', description: 'Perceber intenções e mentiras.' },
  { name: 'Investigação', attribute: 'INT', description: 'Buscar pistas e informações.' },
  { name: 'Ladinagem', attribute: 'DES', description: 'Abrir fechaduras e desarmar armadilhas.' },
  { name: 'Luta', attribute: 'FOR', description: 'Combate corpo a corpo.' },
  { name: 'Misticismo', attribute: 'INT', description: 'Conhecimento arcano e magia.' },
  { name: 'Nobreza', attribute: 'INT', description: 'Heráldica e etiqueta.' },
  { name: 'Ofício', attribute: 'INT', description: 'Criar e reparar itens.' },
  { name: 'Percepção', attribute: 'SAB', description: 'Notar detalhes e perigos.' },
  { name: 'Pilotagem', attribute: 'DES', description: 'Conduzir veículos.' },
  { name: 'Pontaria', attribute: 'DES', description: 'Ataques à distância.' },
  { name: 'Reflexos', attribute: 'DES', description: 'Esquivar-se de ataques.' },
  { name: 'Religião', attribute: 'SAB', description: 'Conhecimento divino.' },
  { name: 'Sobrevivência', attribute: 'SAB', description: 'Orientação e rastreamento.' },
  { name: 'Vontade', attribute: 'SAB', description: 'Resistência mental.' },
]

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Replace with actual API calls
  // const [racesResult, classesResult, deitiesResult, originsResult] = await Promise.all([
  //   getRaces(),
  //   getClasses(),
  //   getDeities(),
  //   getOrigins(),
  // ])

  return json<WizardLoaderData>({
    races: mockRaces,
    classes: mockClasses,
    deities: mockDeities,
    origins: mockOrigins,
    skills: mockSkills,
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const wizardDataJson = formData.get('wizardData') as string

  if (!wizardDataJson) {
    return json({ error: 'Dados do personagem não fornecidos' }, { status: 400 })
  }

  try {
    const wizardData = JSON.parse(wizardDataJson)

    // TODO: Transform wizard data to Character type
    // TODO: Call createCharacter API
    // const character = transformWizardToCharacter(wizardData)
    // const result = await createCharacter(character)

    // For now, generate a mock ID and redirect
    const mockId = `char-${Date.now()}`

    return redirect(`/characters/${mockId}`)
  } catch (error) {
    console.error('Failed to create character:', error)
    return json({ error: 'Erro ao criar personagem' }, { status: 500 })
  }
}

export default function CharacterNewPage() {
  const loaderData = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <WizardProvider loaderData={loaderData}>
      <div className="min-h-screen bg-bg">
        {/* Header */}
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

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-6">
          <CharacterCreationWizard isSubmitting={isSubmitting} />
        </main>
      </div>
    </WizardProvider>
  )
}
