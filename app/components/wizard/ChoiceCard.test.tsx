import { describe, it, expect } from 'vitest'
import type { PendingChoice } from '~/types/wizard'

// Logic extracted from ChoiceCard to determine layout mode
function isSpellChoice(choice: Pick<PendingChoice, 'effectType'>): boolean {
  return choice.effectType === 'spell-grant'
}

describe('ChoiceCard layout logic', () => {
  it('spell-grant uses compact spell layout', () => {
    expect(isSpellChoice({ effectType: 'spell-grant' })).toBe(true)
  })

  it('other effectTypes use standard layout', () => {
    const nonSpellTypes = ['attribute-bonus', 'skill-bonus', 'caminho-do-arcanista',
      'linhagem-do-feiticeiro', 'escola-de-magias', 'element-choice', undefined]
    nonSpellTypes.forEach(effectType => {
      expect(isSpellChoice({ effectType: effectType as PendingChoice['effectType'] })).toBe(false)
    })
  })
})
