import { vi, describe, it, expect, beforeEach } from 'vitest'
import { action as equipmentAction } from './api.characters.$characterId.equipment'
import { action as attributesAction } from './api.characters.$characterId.attributes'
import { action as resistancesAction } from './api.characters.$characterId.resistances'
import { action as skillsAction } from './api.characters.$characterId.skills'
import { action as weaponsAction } from './api.characters.$characterId.weapons'
import { action as actionsListAction } from './api.characters.$characterId.actions-list'
import { action as abilitiesAction } from './api.characters.$characterId.abilities'
import { action as spellsAction } from './api.characters.$characterId.spells'
import { action as availableActionsAction } from './api.characters.$characterId.available-actions'
import { action as initiativeAction } from './api.characters.$characterId.initiative'
import { action as notesAction } from './api.characters.$characterId.notes'

vi.mock('~/utils/session.server', () => ({
  requireUserToken: vi.fn().mockResolvedValue('test-token'),
}))

const mockGqlRequest = vi.fn()
vi.mock('~/utils/graphql.server', () => ({
  gqlRequest: (...args: unknown[]) => mockGqlRequest(...args),
}))

const CHARACTER_ID = 'char-123'

function makeRequest(body: unknown, method = 'PATCH') {
  const hasBody = method !== 'GET' && method !== 'HEAD'
  return new Request(`http://localhost/api/characters/${CHARACTER_ID}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
  })
}

const params = { characterId: CHARACTER_ID }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('api.characters.$characterId.equipment', () => {
  it('calls updateCharacterEquipment and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterEquipment: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const res = await equipmentAction({ request: makeRequest({ equippedItems: {}, backpack: [] }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
    expect(mockGqlRequest).toHaveBeenCalledWith(
      expect.stringContaining('UpdateCharacterEquipment'),
      expect.objectContaining({ id: CHARACTER_ID, equippedItems: {}, backpack: [] }),
      'test-token'
    )
  })

  it('returns 405 for non-PATCH', async () => {
    const res = await equipmentAction({ request: makeRequest({}, 'GET'), params, context: {} } as never)
    expect(res.status).toBe(405)
  })
})

describe('api.characters.$characterId.attributes', () => {
  it('calls updateCharacterAttributes and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterAttributes: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const attrs = [{ label: 'FOR', value: 14, modifier: 2, visible: true }]
    const res = await attributesAction({ request: makeRequest({ attributes: attrs }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
    expect(mockGqlRequest).toHaveBeenCalledWith(
      expect.stringContaining('UpdateCharacterAttributes'),
      expect.objectContaining({ id: CHARACTER_ID, attributes: attrs }),
      'test-token'
    )
  })

  it('returns 405 for non-PATCH', async () => {
    const res = await attributesAction({ request: makeRequest({}, 'POST'), params, context: {} } as never)
    expect(res.status).toBe(405)
  })
})

describe('api.characters.$characterId.resistances', () => {
  it('calls updateCharacterResistances and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterResistances: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const res = await resistancesAction({ request: makeRequest({ resistances: [] }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
  })
})

describe('api.characters.$characterId.skills', () => {
  it('calls updateCharacterSkills and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterSkills: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const res = await skillsAction({ request: makeRequest({ skills: [] }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
  })
})

describe('api.characters.$characterId.weapons', () => {
  it('calls updateCharacterWeapons and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterWeapons: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const res = await weaponsAction({ request: makeRequest({ weapons: [] }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
  })
})

describe('api.characters.$characterId.actions-list', () => {
  it('calls updateCharacterActionsList and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterActionsList: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const res = await actionsListAction({ request: makeRequest({ actionsList: [] }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
  })
})

describe('api.characters.$characterId.abilities', () => {
  it('calls updateCharacterAbilities and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterAbilities: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const abilities = [{ id: 'a1', name: 'Golpe Poderoso', description: '...', type: 'passive', isFavorite: true, favoriteOrder: 0 }]
    const res = await abilitiesAction({ request: makeRequest({ abilities }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
    expect(mockGqlRequest).toHaveBeenCalledWith(
      expect.stringContaining('UpdateCharacterAbilities'),
      expect.objectContaining({ id: CHARACTER_ID, abilities }),
      'test-token'
    )
  })

  it('returns 500 when gqlRequest throws', async () => {
    mockGqlRequest.mockRejectedValue(new Error('Network error'))

    const res = await abilitiesAction({ request: makeRequest({ abilities: [] }), params, context: {} } as never)
    expect(res.status).toBe(500)
  })
})

describe('api.characters.$characterId.spells', () => {
  it('calls updateCharacterSpells and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterSpells: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const spells = [{ id: 's1', name: 'Bola de Fogo', type: 'arcane', circle: 3, school: 'evocation', execution: 'standard', range: '20m', duration: 'instantaneous', description: '...' }]
    const res = await spellsAction({ request: makeRequest({ spells }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
    expect(mockGqlRequest).toHaveBeenCalledWith(
      expect.stringContaining('UpdateCharacterSpells'),
      expect.objectContaining({ id: CHARACTER_ID, spells }),
      'test-token'
    )
  })

  it('returns 500 when gqlRequest throws', async () => {
    mockGqlRequest.mockRejectedValue(new Error('Network error'))

    const res = await spellsAction({ request: makeRequest({ spells: [] }), params, context: {} } as never)
    expect(res.status).toBe(500)
  })
})

describe('api.characters.$characterId.available-actions', () => {
  it('calls updateCharacterAvailableActions and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterAvailableActions: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const availableActions = { standard: 1, movement: 1, free: 1, full: 1, reaction: 1 }
    const res = await availableActionsAction({ request: makeRequest({ availableActions }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
  })
})

describe('api.characters.$characterId.initiative', () => {
  it('calls updateCharacterInitiativeRoll and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterInitiativeRoll: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const res = await initiativeAction({ request: makeRequest({ initiativeRoll: 15 }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
    expect(mockGqlRequest).toHaveBeenCalledWith(
      expect.stringContaining('UpdateCharacterInitiativeRoll'),
      expect.objectContaining({ id: CHARACTER_ID, initiativeRoll: 15 }),
      'test-token'
    )
  })

  it('accepts null initiativeRoll', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterInitiativeRoll: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const res = await initiativeAction({ request: makeRequest({ initiativeRoll: null }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
  })
})

describe('api.characters.$characterId.notes', () => {
  it('calls updateCharacterNotes and returns ok', async () => {
    mockGqlRequest.mockResolvedValue({ data: { updateCharacterNotes: { character: { id: CHARACTER_ID, version: 2 }, errors: null } } })

    const notes = { items: [], customTags: [] }
    const res = await notesAction({ request: makeRequest({ notes }), params, context: {} } as never)
    const json = await res.json()

    expect(json).toEqual({ ok: true })
    expect(mockGqlRequest).toHaveBeenCalledWith(
      expect.stringContaining('UpdateCharacterNotes'),
      expect.objectContaining({ id: CHARACTER_ID, notes }),
      'test-token'
    )
  })

  it('returns 405 for non-PATCH', async () => {
    const res = await notesAction({ request: makeRequest({}, 'GET'), params, context: {} } as never)
    expect(res.status).toBe(405)
  })

  it('returns 500 when gqlRequest throws', async () => {
    mockGqlRequest.mockRejectedValue(new Error('Network error'))

    const res = await notesAction({ request: makeRequest({ notes: { items: [], customTags: [] } }), params, context: {} } as never)
    expect(res.status).toBe(500)
  })
})
