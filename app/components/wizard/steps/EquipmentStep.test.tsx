import { describe, it, expect } from 'vitest'
import type { OriginItem } from '~/types/wizard'

// ── Logic extracted from EquipmentStep for origin item rendering ──────────────

function formatOriginItemLabel(item: OriginItem): string {
  if (item.type === 'fixed') {
    return item.quantity && item.quantity > 1
      ? `${item.text} ×${item.quantity}`
      : item.text
  }
  return item.text
}

function summarizeOriginItem(
  item: OriginItem,
  index: number,
  choices: Record<number, string>
): string {
  if (item.type === 'fixed') {
    return item.quantity && item.quantity > 1
      ? `${item.text} ×${item.quantity}`
      : item.text
  }
  return choices[index] ?? `${item.text} (pendente)`
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EquipmentStep origin item rendering logic', () => {
  describe('formatOriginItemLabel', () => {
    it('returns text for a fixed item without quantity', () => {
      const item: OriginItem = { type: 'fixed', text: 'Barraca' }
      expect(formatOriginItemLabel(item)).toBe('Barraca')
    })

    it('appends ×N for a fixed item with quantity > 1', () => {
      const item: OriginItem = { type: 'fixed', text: 'Flecha', quantity: 20 }
      expect(formatOriginItemLabel(item)).toBe('Flecha ×20')
    })

    it('does not append ×1 for a fixed item with quantity 1', () => {
      const item: OriginItem = { type: 'fixed', text: 'Bálsamo restaurador', quantity: 1 }
      expect(formatOriginItemLabel(item)).toBe('Bálsamo restaurador')
    })

    it('returns the prompt text for a choice item', () => {
      const item: OriginItem = {
        type: 'choice',
        text: 'Animal de companhia',
        options: [{ text: 'Cão de caça' }, { text: 'Cavalo' }],
      }
      expect(formatOriginItemLabel(item)).toBe('Animal de companhia')
    })
  })

  describe('summarizeOriginItem', () => {
    it('renders fixed item text in the summary', () => {
      const item: OriginItem = { type: 'fixed', text: 'Equipamento de viagem' }
      expect(summarizeOriginItem(item, 0, {})).toBe('Equipamento de viagem')
    })

    it('renders fixed item with quantity in the summary', () => {
      const item: OriginItem = { type: 'fixed', text: 'Ração de viagem', quantity: 10 }
      expect(summarizeOriginItem(item, 0, {})).toBe('Ração de viagem ×10')
    })

    it('renders chosen option text for a resolved choice item', () => {
      const item: OriginItem = {
        type: 'choice',
        text: 'Ferramenta de crime',
        options: [{ text: 'Estojo de disfarces' }, { text: 'Gazua' }],
      }
      const choices = { 0: 'Gazua' }
      expect(summarizeOriginItem(item, 0, choices)).toBe('Gazua')
    })

    it('renders pending label for an unresolved choice item', () => {
      const item: OriginItem = {
        type: 'choice',
        text: 'Arma à distância',
        options: [{ text: 'Arma simples' }, { text: 'Arma marcial' }],
      }
      expect(summarizeOriginItem(item, 2, {})).toBe('Arma à distância (pendente)')
    })

    it('uses item index as key so multiple choice items track independently', () => {
      const choices: Record<number, string> = { 0: 'Gazua', 2: 'Martelo de carne (mesmas estatísticas de uma clava)' }
      const item0: OriginItem = {
        type: 'choice',
        text: 'Ferramenta de crime',
        options: [{ text: 'Estojo de disfarces' }, { text: 'Gazua' }],
      }
      const item2: OriginItem = {
        type: 'choice',
        text: 'Utensílio de cozinha',
        options: [
          { text: 'Rolo de macarrão (mesmas estatísticas de uma clava)' },
          { text: 'Martelo de carne (mesmas estatísticas de uma clava)' },
        ],
      }
      expect(summarizeOriginItem(item0, 0, choices)).toBe('Gazua')
      expect(summarizeOriginItem(item2, 2, choices)).toBe('Martelo de carne (mesmas estatísticas de uma clava)')
    })
  })
})

describe('OriginItem type structure', () => {
  it('fixed item has type, text, and optional quantity', () => {
    const item: OriginItem = { type: 'fixed', text: 'Símbolo sagrado' }
    expect(item.type).toBe('fixed')
    expect(item.text).toBe('Símbolo sagrado')
    expect(item.quantity).toBeUndefined()
  })

  it('choice item has type, text, and options array', () => {
    const item: OriginItem = {
      type: 'choice',
      text: 'Animal de companhia',
      options: [
        { text: 'Cão de caça' },
        { text: 'Cavalo' },
        { text: 'Pônei' },
        { text: 'Trobo' },
      ],
    }
    expect(item.type).toBe('choice')
    expect(item.options).toHaveLength(4)
    expect(item.options[0].text).toBe('Cão de caça')
  })
})
