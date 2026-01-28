export type SkillDefinition = {
  name: string
  attribute: string
  tooltip: string
}

export const TORMENTA20_SKILLS: SkillDefinition[] = [
  // Força
  { name: 'Atletismo', attribute: 'FOR', tooltip: 'Escalar, nadar, saltar e outras proezas atléticas' },

  // Destreza
  { name: 'Acrobacia', attribute: 'DES', tooltip: 'Equilíbrio, contorcionismo e acrobacias' },
  { name: 'Cavalgar', attribute: 'DES', tooltip: 'Montar e controlar montarias' },
  { name: 'Furtividade', attribute: 'DES', tooltip: 'Mover-se silenciosamente e esconder-se' },
  { name: 'Iniciativa', attribute: 'DES', tooltip: 'Reagir rapidamente no início do combate' },
  { name: 'Ladinagem', attribute: 'DES', tooltip: 'Abrir fechaduras e desativar armadilhas' },
  { name: 'Pilotagem', attribute: 'DES', tooltip: 'Pilotar veículos e embarcações' },
  { name: 'Pontaria', attribute: 'DES', tooltip: 'Acertar alvos a distância' },
  { name: 'Reflexos', attribute: 'DES', tooltip: 'Esquivar-se de ataques e perigos' },

  // Constituição
  { name: 'Fortitude', attribute: 'CON', tooltip: 'Resistir a venenos, doenças e efeitos físicos' },

  // Inteligência
  { name: 'Conhecimento', attribute: 'INT', tooltip: 'Lembrar de informações sobre história, geografia, etc' },
  { name: 'Cura', attribute: 'INT', tooltip: 'Tratar ferimentos e doenças' },
  { name: 'Identificar Magia', attribute: 'INT', tooltip: 'Identificar efeitos mágicos e itens mágicos' },
  { name: 'Investigação', attribute: 'INT', tooltip: 'Encontrar pistas e desvendar mistérios' },
  { name: 'Misticismo', attribute: 'INT', tooltip: 'Conhecimento sobre magia, planos e criaturas' },
  { name: 'Ofício', attribute: 'INT', tooltip: 'Criar e reparar itens' },

  // Sabedoria
  { name: 'Intuição', attribute: 'SAB', tooltip: 'Perceber mentiras e intenções' },
  { name: 'Lidar com Animais', attribute: 'SAB', tooltip: 'Acalmar e treinar animais' },
  { name: 'Perceção', attribute: 'SAB', tooltip: 'Notar detalhes e perigos' },
  { name: 'Sobrevivência', attribute: 'SAB', tooltip: 'Rastrear, caçar e sobreviver na natureza' },
  { name: 'Vontade', attribute: 'SAB', tooltip: 'Resistir a efeitos mentais e mágicos' },

  // Carisma
  { name: 'Atuação', attribute: 'CAR', tooltip: 'Interpretar, disfarçar-se e entreter' },
  { name: 'Diplomacia', attribute: 'CAR', tooltip: 'Negociar e persuadir' },
  { name: 'Enganação', attribute: 'CAR', tooltip: 'Mentir e enganar' },
  { name: 'Intimidação', attribute: 'CAR', tooltip: 'Ameaçar e forçar' },
  { name: 'Obter Informação', attribute: 'CAR', tooltip: 'Coletar rumores e informações' },
]
