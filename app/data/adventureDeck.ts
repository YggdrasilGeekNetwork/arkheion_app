import type { Card, CardType } from '~/types/encounter'

// ============================================
// 📖 ENREDO (Plot) - 7 cartas
// ============================================
const PLOT_CARDS: Card[] = [
  {
    id: 'plot-trabalho',
    type: 'plot',
    name: 'Trabalho de Aventureiro',
    description: 'Um empregador contrata os heróis para uma missão específica. Pode ser um nobre, uma guilda, um templo ou até mesmo um governo.',
  },
  {
    id: 'plot-jornada',
    type: 'plot',
    name: 'Jornada',
    description: 'Os heróis devem viajar de um ponto a outro, enfrentando desafios pelo caminho. O destino pode guardar segredos ou perigos.',
  },
  {
    id: 'plot-resgate',
    type: 'plot',
    name: 'Resgate',
    description: 'Alguém importante foi capturado ou está em perigo. Os heróis devem encontrá-lo e trazê-lo de volta em segurança.',
  },
  {
    id: 'plot-perseguicao',
    type: 'plot',
    name: 'Perseguição',
    description: 'Os heróis devem caçar um alvo que está fugindo, ou eles mesmos estão sendo perseguidos por um inimigo implacável.',
  },
  {
    id: 'plot-conflito',
    type: 'plot',
    name: 'Conflito',
    description: 'Duas ou mais facções estão em guerra ou prestes a entrar em conflito. Os heróis podem escolher um lado ou tentar mediar.',
  },
  {
    id: 'plot-diplomacia',
    type: 'plot',
    name: 'Diplomacia',
    description: 'Uma situação delicada requer negociação, persuasão e intriga política em vez de violência direta.',
  },
  {
    id: 'plot-misterio',
    type: 'plot',
    name: 'Mistério',
    description: 'Algo estranho está acontecendo e os heróis devem investigar, reunir pistas e descobrir a verdade antes que seja tarde.',
  },
]

// ============================================
// 👤 PERSONAGEM (Character) - 10 cartas
// ============================================
const CHARACTER_CARDS: Card[] = [
  {
    id: 'char-autoridade',
    type: 'character',
    name: 'Autoridade',
    description: 'Alguém com poder político, militar ou religioso. Pode ser um nobre, general, sumo-sacerdote ou outro líder.',
  },
  {
    id: 'char-aliado',
    type: 'character',
    name: 'Aliado',
    description: 'Um amigo ou contato útil que pode fornecer informações, recursos ou apoio aos heróis.',
  },
  {
    id: 'char-rival',
    type: 'character',
    name: 'Rival',
    description: 'Alguém que compete com os heróis pelos mesmos objetivos, mas não é necessariamente um vilão.',
  },
  {
    id: 'char-protegido',
    type: 'character',
    name: 'Protegido',
    description: 'Uma pessoa vulnerável que precisa de proteção. Pode ser um jovem, um ancião ou alguém em perigo.',
  },
  {
    id: 'char-mentor',
    type: 'character',
    name: 'Mentor',
    description: 'Um sábio ou mestre que pode ensinar, orientar ou fornecer conselhos valiosos aos heróis.',
  },
  {
    id: 'char-profeta',
    type: 'character',
    name: 'Profeta',
    description: 'Alguém com visões do futuro ou conhecimento oculto. Suas palavras podem ser enigmáticas mas importantes.',
  },
  {
    id: 'char-bufao',
    type: 'character',
    name: 'Bufão',
    description: 'Um personagem cômico ou excêntrico que pode parecer inofensivo, mas talvez saiba mais do que aparenta.',
  },
  {
    id: 'char-capanga',
    type: 'character',
    name: 'Capanga',
    description: 'Um subordinado de alguém mais poderoso. Pode ser convencido a mudar de lado ou fornecer informações.',
  },
  {
    id: 'char-idolo',
    type: 'character',
    name: 'Ídolo',
    description: 'Uma figura famosa e admirada. Herói local, artista renomado ou lenda viva que atrai atenção.',
  },
  {
    id: 'char-entidade',
    type: 'character',
    name: 'Entidade',
    description: 'Um ser sobrenatural: espírito, demônio, fada ou outra criatura de outro plano.',
  },
]

// ============================================
// ⚠️ AMEAÇA (Threat) - Por Tier
// ============================================
const THREAT_CARDS: Card[] = [
  // Tier 1: ND 0-4
  { id: 'threat-t1-clerigos', type: 'threat', name: 'Clérigos', description: 'Cultistas, sacerdotes malignos ou fanáticos religiosos de baixo escalão.', subcategory: 'Humanoide', tier: 1 },
  { id: 'threat-t1-arcanistas', type: 'threat', name: 'Arcanistas', description: 'Aprendizes de magia, bruxas de aldeia ou feiticeiros iniciantes.', subcategory: 'Humanoide', tier: 1 },
  { id: 'threat-t1-criminosos', type: 'threat', name: 'Criminosos', description: 'Bandidos, ladrões, contrabandistas e outros fora-da-lei comuns.', subcategory: 'Humanoide', tier: 1 },
  { id: 'threat-t1-dragoes', type: 'threat', name: 'Dragões', description: 'Filhotes de dragão, dragonetes ou pseudo-dragões agressivos.', subcategory: 'Dragão', tier: 1 },
  { id: 'threat-t1-elementais', type: 'threat', name: 'Elementais', description: 'Elementais menores, mefitas ou criaturas elementais fracas.', subcategory: 'Elemental', tier: 1 },
  { id: 'threat-t1-espiritos', type: 'threat', name: 'Espíritos', description: 'Assombrações menores, espíritos inquietos ou fantasmas fracos.', subcategory: 'Espírito', tier: 1 },
  { id: 'threat-t1-homens-fera', type: 'threat', name: 'Homens-fera', description: 'Lobisomens recém-transformados ou outros licantropos fracos.', subcategory: 'Humanoide', tier: 1 },
  { id: 'threat-t1-humanoides', type: 'threat', name: 'Humanoides', description: 'Goblins, kobolds, orcs ou outros humanoides tribais.', subcategory: 'Humanoide', tier: 1 },
  { id: 'threat-t1-lefou', type: 'threat', name: 'Lefou', description: 'Aberrações menores corrompidas pela Tormenta.', subcategory: 'Lefou', tier: 1 },
  { id: 'threat-t1-monstros', type: 'threat', name: 'Monstros', description: 'Bestas selvagens, vermes gigantes ou monstros naturais perigosos.', subcategory: 'Monstro', tier: 1 },
  { id: 'threat-t1-mortos-vivos', type: 'threat', name: 'Mortos-vivos', description: 'Esqueletos, zumbis ou outros mortos-vivos menores.', subcategory: 'Morto-vivo', tier: 1 },

  // Tier 2: ND 5-10
  { id: 'threat-t2-clerigos', type: 'threat', name: 'Clérigos', description: 'Sacerdotes estabelecidos, líderes de culto ou inquisidores.', subcategory: 'Humanoide', tier: 2 },
  { id: 'threat-t2-arcanistas', type: 'threat', name: 'Arcanistas', description: 'Magos experientes, feiticeiros poderosos ou bruxas temidas.', subcategory: 'Humanoide', tier: 2 },
  { id: 'threat-t2-criminosos', type: 'threat', name: 'Criminosos', description: 'Mestres de guilda, assassinos profissionais ou senhores do crime.', subcategory: 'Humanoide', tier: 2 },
  { id: 'threat-t2-dragoes', type: 'threat', name: 'Dragões', description: 'Dragões jovens ou dragões menores adultos.', subcategory: 'Dragão', tier: 2 },
  { id: 'threat-t2-elementais', type: 'threat', name: 'Elementais', description: 'Elementais padrão ou gênios menores.', subcategory: 'Elemental', tier: 2 },
  { id: 'threat-t2-espiritos', type: 'threat', name: 'Espíritos', description: 'Espectros, banshees ou espíritos vingativos.', subcategory: 'Espírito', tier: 2 },
  { id: 'threat-t2-homens-fera', type: 'threat', name: 'Homens-fera', description: 'Licantropos veteranos ou líderes de matilha.', subcategory: 'Humanoide', tier: 2 },
  { id: 'threat-t2-humanoides', type: 'threat', name: 'Humanoides', description: 'Hobgoblins, bugbears, gigantes menores ou líderes tribais.', subcategory: 'Humanoide', tier: 2 },
  { id: 'threat-t2-lefou', type: 'threat', name: 'Lefou', description: 'Aberrações de Tormenta estabelecidas e perigosas.', subcategory: 'Lefou', tier: 2 },
  { id: 'threat-t2-monstros', type: 'threat', name: 'Monstros', description: 'Hidras, quimeras, mantícoras ou monstros lendários.', subcategory: 'Monstro', tier: 2 },
  { id: 'threat-t2-mortos-vivos', type: 'threat', name: 'Mortos-vivos', description: 'Múmias, vampiros menores ou mortos-vivos inteligentes.', subcategory: 'Morto-vivo', tier: 2 },

  // Tier 3: ND 11-16
  { id: 'threat-t3-clerigos', type: 'threat', name: 'Clérigos', description: 'Sumos-sacerdotes, avatares divinos ou campeões de deuses.', subcategory: 'Humanoide', tier: 3 },
  { id: 'threat-t3-arcanistas', type: 'threat', name: 'Arcanistas', description: 'Arquimagos, liches em formação ou mestres das artes arcanas.', subcategory: 'Humanoide', tier: 3 },
  { id: 'threat-t3-criminosos', type: 'threat', name: 'Criminosos', description: 'Lordes do crime, mestres assassinos ou chefes de sindicatos.', subcategory: 'Humanoide', tier: 3 },
  { id: 'threat-t3-dragoes', type: 'threat', name: 'Dragões', description: 'Dragões adultos em seu auge de poder.', subcategory: 'Dragão', tier: 3 },
  { id: 'threat-t3-elementais', type: 'threat', name: 'Elementais', description: 'Elementais anciões ou gênios poderosos.', subcategory: 'Elemental', tier: 3 },
  { id: 'threat-t3-espiritos', type: 'threat', name: 'Espíritos', description: 'Espíritos ancestrais, fantasmas de heróis ou entidades etéreas.', subcategory: 'Espírito', tier: 3 },
  { id: 'threat-t3-homens-fera', type: 'threat', name: 'Homens-fera', description: 'Reis licantropos ou licantropos amaldiçoados ancestrais.', subcategory: 'Humanoide', tier: 3 },
  { id: 'threat-t3-humanoides', type: 'threat', name: 'Humanoides', description: 'Gigantes das tempestades, reis goblinoides ou warlords.', subcategory: 'Humanoide', tier: 3 },
  { id: 'threat-t3-lefou', type: 'threat', name: 'Lefou', description: 'Generais da Tormenta ou aberrações maiores.', subcategory: 'Lefou', tier: 3 },
  { id: 'threat-t3-monstros', type: 'threat', name: 'Monstros', description: 'Tarrasques jovens, krakens ou monstros apocalípticos.', subcategory: 'Monstro', tier: 3 },
  { id: 'threat-t3-mortos-vivos', type: 'threat', name: 'Mortos-vivos', description: 'Vampiros anciões, liches ou senhores mortos-vivos.', subcategory: 'Morto-vivo', tier: 3 },

  // Tier 4: ND 17-20
  { id: 'threat-t4-clerigos', type: 'threat', name: 'Clérigos', description: 'Porta-vozes divinos, santos corrompidos ou emissários de deuses.', subcategory: 'Humanoide', tier: 4 },
  { id: 'threat-t4-arcanistas', type: 'threat', name: 'Arcanistas', description: 'Liches anciões, arquimagos lendários ou entidades de pura magia.', subcategory: 'Humanoide', tier: 4 },
  { id: 'threat-t4-criminosos', type: 'threat', name: 'Criminosos', description: 'Imperadores do submundo ou mestres de redes criminosas continentais.', subcategory: 'Humanoide', tier: 4 },
  { id: 'threat-t4-dragoes', type: 'threat', name: 'Dragões', description: 'Dragões anciões, wyrms primordiais ou dragões divinos.', subcategory: 'Dragão', tier: 4 },
  { id: 'threat-t4-elementais', type: 'threat', name: 'Elementais', description: 'Príncipes elementais ou avatares dos planos elementais.', subcategory: 'Elemental', tier: 4 },
  { id: 'threat-t4-espiritos', type: 'threat', name: 'Espíritos', description: 'Deuses menores, espíritos primordiais ou entidades cósmicas.', subcategory: 'Espírito', tier: 4 },
  { id: 'threat-t4-homens-fera', type: 'threat', name: 'Homens-fera', description: 'Progenitores da licantropia ou bestas primordiais.', subcategory: 'Humanoide', tier: 4 },
  { id: 'threat-t4-humanoides', type: 'threat', name: 'Humanoides', description: 'Titãs, reis dos gigantes ou conquistadores lendários.', subcategory: 'Humanoide', tier: 4 },
  { id: 'threat-t4-lefou', type: 'threat', name: 'Lefou', description: 'Senhores da Tormenta, avatares de Aharadak ou generais supremos.', subcategory: 'Lefou', tier: 4 },
  { id: 'threat-t4-monstros', type: 'threat', name: 'Monstros', description: 'Tarrasques adultos, leviatãs ou monstros primordiais.', subcategory: 'Monstro', tier: 4 },
  { id: 'threat-t4-mortos-vivos', type: 'threat', name: 'Mortos-vivos', description: 'Deuses da morte, reis lich ou entidades de entropia.', subcategory: 'Morto-vivo', tier: 4 },
]

// ============================================
// 🏠 LOCAL (Location) - 9 tipos
// ============================================
const LOCATION_CARDS: Card[] = [
  {
    id: 'loc-urbano',
    type: 'location',
    name: 'Urbano',
    description: 'Uma cidade, vila ou assentamento. Ruas movimentadas, tavernas, mercados e intrigas políticas.',
  },
  {
    id: 'loc-fortificacao',
    type: 'location',
    name: 'Fortificação',
    description: 'Um castelo, fortaleza, torre ou estrutura defensiva. Muralhas, masmorras e segredos antigos.',
  },
  {
    id: 'loc-rural',
    type: 'location',
    name: 'Rural',
    description: 'Campos, fazendas, aldeias pequenas. Vida simples, mas perigos podem se esconder.',
  },
  {
    id: 'loc-ermos',
    type: 'location',
    name: 'Ermos',
    description: 'Florestas, montanhas, pântanos ou desertos. Natureza selvagem e criaturas perigosas.',
  },
  {
    id: 'loc-subterraneo',
    type: 'location',
    name: 'Subterrâneo',
    description: 'Cavernas, masmorras, ruínas enterradas ou cidades subterrâneas. Escuridão e perigo.',
  },
  {
    id: 'loc-aquatico',
    type: 'location',
    name: 'Aquático',
    description: 'Mares, rios, lagos ou locais subaquáticos. Navios, ilhas e criaturas marinhas.',
  },
  {
    id: 'loc-planar',
    type: 'location',
    name: 'Planar',
    description: 'Outro plano de existência. Reinos divinos, infernais, elementais ou dimensões estranhas.',
  },
  {
    id: 'loc-itinerante',
    type: 'location',
    name: 'Itinerante',
    description: 'Um local móvel: caravana, navio viajante, castelo voador ou portal errante.',
  },
  {
    id: 'loc-inospito',
    type: 'location',
    name: 'Inóspito',
    description: 'Um lugar extremamente perigoso: vulcão ativo, gelo eterno, área da Tormenta.',
  },
]

// ============================================
// 🎒 OBJETO (Object) - 9 tipos
// ============================================
const OBJECT_CARDS: Card[] = [
  {
    id: 'obj-armas',
    type: 'object',
    name: 'Armas',
    description: 'Uma arma especial: espada lendária, arco élfico, martelo divino ou arma amaldiçoada.',
  },
  {
    id: 'obj-equipamento',
    type: 'object',
    name: 'Equipamento',
    description: 'Itens úteis: ferramentas, instrumentos, equipamento de aventureiro ou dispositivos.',
  },
  {
    id: 'obj-protecoes',
    type: 'object',
    name: 'Proteções',
    description: 'Armaduras, escudos, amuletos de proteção ou vestimentas encantadas.',
  },
  {
    id: 'obj-itens-magicos',
    type: 'object',
    name: 'Itens Mágicos',
    description: 'Artefatos, varinhas, anéis, cajados ou outros objetos imbuídos de magia.',
  },
  {
    id: 'obj-riquezas',
    type: 'object',
    name: 'Riquezas',
    description: 'Tesouros, joias, moedas antigas, obras de arte ou itens de grande valor.',
  },
  {
    id: 'obj-mercadorias',
    type: 'object',
    name: 'Mercadorias',
    description: 'Bens comerciais: especiarias, tecidos, minerais raros ou produtos exóticos.',
  },
  {
    id: 'obj-suprimentos',
    type: 'object',
    name: 'Suprimentos',
    description: 'Provisões, remédios, poções, pergaminhos ou itens consumíveis.',
  },
  {
    id: 'obj-veiculos',
    type: 'object',
    name: 'Veículos',
    description: 'Carroças, navios, montarias especiais ou meios de transporte mágicos.',
  },
  {
    id: 'obj-esoterico',
    type: 'object',
    name: 'Esotérico',
    description: 'Tomos de conhecimento proibido, relíquias sagradas, fragmentos planares ou itens únicos.',
  },
]

// ============================================
// ⚡ EVENTO (Event) - 10 tipos
// ============================================
const EVENT_CARDS: Card[] = [
  {
    id: 'evt-acidente',
    type: 'event',
    name: 'Acidente',
    description: 'Algo dá errado: desabamento, incêndio, naufrágio ou outro desastre inesperado.',
  },
  {
    id: 'evt-anomalia',
    type: 'event',
    name: 'Anomalia',
    description: 'Algo estranho acontece: magia selvagem, distorção planar ou fenômeno inexplicável.',
  },
  {
    id: 'evt-celebracao',
    type: 'event',
    name: 'Celebração',
    description: 'Festival, casamento, coroação ou outro evento festivo que atrai multidões.',
  },
  {
    id: 'evt-clima',
    type: 'event',
    name: 'Clima',
    description: 'Tempestade, nevasca, onda de calor ou outro evento climático que afeta a região.',
  },
  {
    id: 'evt-confronto',
    type: 'event',
    name: 'Confronto',
    description: 'Batalha, duelo, emboscada ou conflito armado que os heróis presenciam ou participam.',
  },
  {
    id: 'evt-crise',
    type: 'event',
    name: 'Crise',
    description: 'Praga, fome, economia em colapso ou outro problema que afeta uma comunidade.',
  },
  {
    id: 'evt-encontro',
    type: 'event',
    name: 'Encontro',
    description: 'Os heróis encontram alguém inesperado: velho conhecido, celebridade ou figura misteriosa.',
  },
  {
    id: 'evt-horda',
    type: 'event',
    name: 'Horda',
    description: 'Grande número de criaturas: migração de monstros, exército invasor ou praga de pragas.',
  },
  {
    id: 'evt-reviravolta',
    type: 'event',
    name: 'Reviravolta',
    description: 'Algo muda drasticamente: traição, revelação, morte importante ou mudança de poder.',
  },
  {
    id: 'evt-viagem',
    type: 'event',
    name: 'Viagem',
    description: 'Algo acontece durante uma jornada: encontro na estrada, obstáculo ou desvio forçado.',
  },
]

// ============================================
// DECK COMPLETO
// ============================================
export const ADVENTURE_DECK: Record<CardType, Card[]> = {
  plot: PLOT_CARDS,
  character: CHARACTER_CARDS,
  threat: THREAT_CARDS,
  location: LOCATION_CARDS,
  object: OBJECT_CARDS,
  event: EVENT_CARDS,
}

// Função para obter cartas por tipo
export function getCardsByType(type: CardType): Card[] {
  return ADVENTURE_DECK[type] || []
}

// Função para obter ameaças por tier
export function getThreatsByTier(tier: number): Card[] {
  return THREAT_CARDS.filter(card => card.tier === tier)
}

// Contagem de cartas por tipo
export function getCardCount(type: CardType): number {
  return ADVENTURE_DECK[type]?.length || 0
}
