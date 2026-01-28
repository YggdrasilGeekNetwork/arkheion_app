/**
 * Calcula o bônus de treinamento baseado no nível do personagem
 * +2 do 1º ao 6º níveis
 * +4 do 7º ao 14º níveis
 * +6 do 15º nível em diante
 */
export function getTrainingBonus(level: number): number {
  if (level >= 15) return 6
  if (level >= 7) return 4
  return 2
}

/**
 * Calcula o bônus de metade do nível
 */
export function getHalfLevelBonus(level: number): number {
  return Math.floor(level / 2)
}

/**
 * Calcula o nível total do personagem somando todos os níveis de classe
 */
export function getTotalLevel(classes: Array<{ level: number }>): number {
  return classes.reduce((total, c) => total + c.level, 0)
}
