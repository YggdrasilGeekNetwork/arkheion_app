import { describe, it, expect } from 'vitest'

// Lógica extraída de InventoryTab.tsx para teste isolado

function maxCarrySpaces(forModifier: number): number {
  return 10 + (forModifier >= 0 ? forModifier * 2 : forModifier)
}

// Each item is individual (one card = one unit), so no quantity multiplier
function calculateItemSpaces(item: { spaces?: number | null } | null): number {
  if (!item) return 0
  return item.spaces ?? 1
}

function currencySpaces(to: number, tp: number, tc: number): number {
  return Math.floor(to / 1000) + Math.floor(tp / 1000) + Math.floor(tc / 1000)
}

describe('maxCarrySpaces', () => {
  it('base sem modificador (FOR 0)', () => {
    expect(maxCarrySpaces(0)).toBe(10)
  })

  it('FOR +2 → 10 + 4 = 14', () => {
    expect(maxCarrySpaces(2)).toBe(14)
  })

  it('FOR +5 → 10 + 10 = 20', () => {
    expect(maxCarrySpaces(5)).toBe(20)
  })

  it('FOR -1 subtrai 1 espaço (não 2)', () => {
    expect(maxCarrySpaces(-1)).toBe(9)
  })

  it('FOR -3 → 10 - 3 = 7', () => {
    expect(maxCarrySpaces(-3)).toBe(7)
  })

  it('exemplo do livro: FOR +2 pode carregar 14 espaços', () => {
    expect(maxCarrySpaces(2)).toBe(14)
  })
})

describe('calculateItemSpaces', () => {
  it('item nulo retorna 0', () => {
    expect(calculateItemSpaces(null)).toBe(0)
  })

  it('item sem spaces usa padrão 1', () => {
    expect(calculateItemSpaces({})).toBe(1)
  })

  it('item com spaces null usa padrão 1', () => {
    expect(calculateItemSpaces({ spaces: null })).toBe(1)
  })

  it('item com meio espaço (alquímico): 1 unidade = 0.5 espaço', () => {
    expect(calculateItemSpaces({ spaces: 0.5 })).toBe(0.5)
  })

  it('armadura pesada ocupa 5 espaços', () => {
    expect(calculateItemSpaces({ spaces: 5 })).toBe(5)
  })

  it('arma de duas mãos ocupa 2 espaços', () => {
    expect(calculateItemSpaces({ spaces: 2 })).toBe(2)
  })
})

describe('currencySpaces', () => {
  it('sem moedas = 0 espaços', () => {
    expect(currencySpaces(0, 0, 0)).toBe(0)
  })

  it('999 moedas de ouro = 0 espaços (não ocupa ainda)', () => {
    expect(currencySpaces(999, 0, 0)).toBe(0)
  })

  it('1000 moedas de ouro = 1 espaço', () => {
    expect(currencySpaces(1000, 0, 0)).toBe(1)
  })

  it('1001 moedas de ouro = 1 espaço', () => {
    expect(currencySpaces(1001, 0, 0)).toBe(1)
  })

  it('2000 moedas de ouro = 2 espaços', () => {
    expect(currencySpaces(2000, 0, 0)).toBe(2)
  })

  it('999 TO + 999 TP + 999 TC = 0 espaços (tipos independentes)', () => {
    expect(currencySpaces(999, 999, 999)).toBe(0)
  })

  it('1000 TO + 1000 TP + 1000 TC = 3 espaços', () => {
    expect(currencySpaces(1000, 1000, 1000)).toBe(3)
  })

  it('1500 TO = 1 espaço (floor, não ceil)', () => {
    expect(currencySpaces(1500, 0, 0)).toBe(1)
  })
})
