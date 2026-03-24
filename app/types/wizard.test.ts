import { describe, it, expect } from 'vitest'
import { initialWizardState } from '~/types/wizard'
import type { OriginItem, OriginItemOption, WizardState } from '~/types/wizard'

describe('OriginItem types', () => {
  it('OriginItemOption has text field', () => {
    const opt: OriginItemOption = { text: 'Cão de caça' }
    expect(opt.text).toBe('Cão de caça')
  })

  it('fixed OriginItem has correct shape', () => {
    const item: OriginItem = { type: 'fixed', text: 'Barraca' }
    expect(item.type).toBe('fixed')
    expect(item.text).toBe('Barraca')
  })

  it('fixed OriginItem supports optional quantity', () => {
    const item: OriginItem = { type: 'fixed', text: 'Bálsamo restaurador', quantity: 2 }
    expect(item.quantity).toBe(2)
  })

  it('choice OriginItem has options array', () => {
    const item: OriginItem = {
      type: 'choice',
      text: 'Ferramenta de crime',
      options: [{ text: 'Estojo de disfarces' }, { text: 'Gazua' }],
    }
    expect(item.type).toBe('choice')
    expect(item.options).toHaveLength(2)
  })
})

describe('initialWizardState', () => {
  it('includes originItemChoices as empty record', () => {
    expect(initialWizardState.data.originItemChoices).toEqual({})
  })

  it('initialWizardState satisfies WizardState type', () => {
    const state: WizardState = initialWizardState
    expect(state.data.originItemChoices).toBeDefined()
  })
})
