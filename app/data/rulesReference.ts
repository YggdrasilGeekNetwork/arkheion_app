export type RuleCategory = 'Combate' | 'Condicoes' | 'Descanso' | 'Magia' | 'Movimento'

export type RuleEntry = {
  id: string
  title: string
  category: RuleCategory
  content: string
  tags: string[]
}

export const RULE_CATEGORIES: { id: RuleCategory; label: string; icon: string }[] = [
  { id: 'Combate', label: 'Combate', icon: '⚔️' },
  { id: 'Condicoes', label: 'Condições', icon: '💫' },
  { id: 'Descanso', label: 'Descanso', icon: '🛏️' },
  { id: 'Magia', label: 'Magia', icon: '✨' },
  { id: 'Movimento', label: 'Movimento', icon: '🏃' },
]

export const RULES: RuleEntry[] = [
  {
    id: 'ataque-oportunidade',
    title: 'Ataque de Oportunidade',
    category: 'Combate',
    content: 'Quando uma criatura que você pode ver sai do seu alcance corpo a corpo sem usar a ação Esquivar, você pode usar sua reação para fazer um ataque corpo a corpo contra ela. Você só tem uma reação por rodada.',
    tags: ['ataque', 'oportunidade', 'reação', 'corpo a corpo'],
  },
  {
    id: 'agarrar',
    title: 'Agarrar',
    category: 'Combate',
    content: 'Você pode usar a ação padrão para tentar agarrar uma criatura. Faça um teste de manobra (ataque corpo a corpo) contra a Defesa da criatura. Se bem-sucedido, a criatura fica agarrada. Criatura agarrada: deslocamento 0, –2 em ataques e testes de Destreza.',
    tags: ['agarrar', 'manobra', 'condição', 'corpo a corpo'],
  },
  {
    id: 'flanquear',
    title: 'Flanquear',
    category: 'Combate',
    content: 'Quando você e um aliado estão em lados opostos de um inimigo (ameaçando-o corpo a corpo), vocês estão flanqueando. Flanquear concede +2 nos testes de ataque corpo a corpo contra o inimigo flanqueado.',
    tags: ['flanquear', 'posicionamento', 'bônus', 'ataque'],
  },
  {
    id: 'cond-abalado',
    title: 'Abalado',
    category: 'Condicoes',
    content: 'A criatura sofre –2 em testes de perícia, testes de ataque e testes de resistência. Se já estiver abalada e sofrer novamente, fica apavorada.',
    tags: ['abalado', 'medo', 'penalidade', 'condição'],
  },
  {
    id: 'cond-cego',
    title: 'Cego',
    category: 'Condicoes',
    content: 'A criatura não pode enxergar. Sofre –5 em testes de Defesa e Reflexos. Ataques contra ela têm +2. Ela falha automaticamente em testes de Percepção baseados em visão. Todos os oponentes são considerados camuflados para ela.',
    tags: ['cego', 'visão', 'penalidade', 'condição'],
  },
  {
    id: 'descanso-curto',
    title: 'Descanso Curto',
    category: 'Descanso',
    content: 'Um descanso curto dura pelo menos 30 minutos. Ao final, você recupera PV iguais ao seu nível + modificador de Constituição (mínimo 1). Você pode gastar uma quantidade de PM igual ao seu nível para recuperar PV adicionais.',
    tags: ['descanso', 'curto', 'recuperação', 'PV', 'PM'],
  },
  {
    id: 'descanso-longo',
    title: 'Descanso Longo',
    category: 'Descanso',
    content: 'Um descanso longo dura pelo menos 8 horas. Ao final, você recupera todos os PV e PM. Condições temporárias são removidas. Você só pode se beneficiar de um descanso longo a cada 24 horas.',
    tags: ['descanso', 'longo', 'recuperação', 'PV', 'PM', 'completo'],
  },
  {
    id: 'magia-concentracao',
    title: 'Concentração',
    category: 'Magia',
    content: 'Algumas magias exigem concentração para manter seus efeitos. Se você sofrer dano enquanto mantém uma magia, faça um teste de Fortitude (CD = 10 ou metade do dano, o que for maior). Se falhar, a magia é dissipada. Você só pode manter concentração em uma magia por vez.',
    tags: ['concentração', 'magia', 'fortitude', 'manter'],
  },
  {
    id: 'movimento-dificil',
    title: 'Terreno Difícil',
    category: 'Movimento',
    content: 'Em terreno difícil (lama, entulho, escombros, vegetação densa), cada 1,5m de movimento custa 3m de deslocamento. Não é possível correr ou fazer investida em terreno difícil.',
    tags: ['terreno', 'difícil', 'movimento', 'deslocamento'],
  },
  {
    id: 'investida',
    title: 'Investida',
    category: 'Combate',
    content: 'Ação completa. Mova-se em linha reta até o dobro do seu deslocamento e faça um ataque corpo a corpo com +2 no teste de ataque. Até o início do seu próximo turno, você sofre –2 na Defesa. Não pode ser feita em terreno difícil.',
    tags: ['investida', 'ataque', 'movimento', 'ação completa'],
  },
]
