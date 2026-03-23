import type { Character, CharacterSummary } from '~/types/character'

// MOCKED: Using hardcoded API base URL since we're not using a real backend
const API_BASE_URL = '/api'

type ApiResponse<T> = {
  data?: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    console.error('API Error:', error)
    return {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

// Auth APIs
export async function login(email: string, password: string) {
  return fetchApi<{ token: string; user: { id: string; email: string; name: string } }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  )
}

export async function signup(email: string, password: string, name: string) {
  return fetchApi<{ token: string; user: { id: string; email: string; name: string } }>(
    '/auth/signup',
    {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }
  )
}

export async function logout() {
  return fetchApi('/auth/logout', { method: 'POST' })
}

// Character APIs
export async function getCharacters() {
  return fetchApi<CharacterSummary[]>('/characters')
}

export async function getCharacter(id: string) {
  return fetchApi<Character>(`/characters/${id}`)
}

export async function createCharacter(character: Partial<Character>) {
  return fetchApi<Character>('/characters', {
    method: 'POST',
    body: JSON.stringify(character),
  })
}

export async function updateCharacter(id: string, updates: Partial<Character>) {
  return fetchApi<Character>(`/characters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function deleteCharacter(id: string) {
  return fetchApi(`/characters/${id}`, {
    method: 'DELETE',
  })
}

// Health & Mana specific updates (optimized for frequent updates)
export async function updateHealth(id: string, health: number) {
  return fetchApi<{ health: number }>(`/characters/${id}/health`, {
    method: 'PATCH',
    body: JSON.stringify({ health }),
  })
}

export async function updateMana(id: string, mana: number) {
  return fetchApi<{ mana: number }>(`/characters/${id}/mana`, {
    method: 'PATCH',
    body: JSON.stringify({ mana }),
  })
}

export async function updateCurrencies(id: string, currencies: { tc: number; tp: number; to: number }) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/currencies`, {
    method: 'PATCH',
    body: JSON.stringify(currencies),
  })
}

export async function updateSensesVisibility(id: string, hiddenSenseNames: string[]) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/senses-visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ hiddenSenseNames }),
  })
}

export async function updateNotes(id: string, notes: unknown) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  })
}

export async function updateEquipment(
  id: string,
  equippedItems: unknown,
  backpack: unknown[]
) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/equipment`, {
    method: 'PATCH',
    body: JSON.stringify({ equippedItems, backpack }),
  })
}

export async function updateAttributes(id: string, attributes: unknown[]) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/attributes`, {
    method: 'PATCH',
    body: JSON.stringify({ attributes }),
  })
}

export async function updateResistances(id: string, resistances: unknown[]) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/resistances`, {
    method: 'PATCH',
    body: JSON.stringify({ resistances }),
  })
}

export async function updateSkills(id: string, skills: unknown[]) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/skills`, {
    method: 'PATCH',
    body: JSON.stringify({ skills }),
  })
}

export async function updateWeapons(id: string, weapons: unknown[]) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/weapons`, {
    method: 'PATCH',
    body: JSON.stringify({ weapons }),
  })
}

export async function updateActionsList(id: string, actionsList: unknown[]) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/actions-list`, {
    method: 'PATCH',
    body: JSON.stringify({ actionsList }),
  })
}

export async function updateAbilities(id: string, abilities: unknown[]) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/abilities`, {
    method: 'PATCH',
    body: JSON.stringify({ abilities }),
  })
}

export async function updateSpells(id: string, spells: unknown[]) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/spells`, {
    method: 'PATCH',
    body: JSON.stringify({ spells }),
  })
}

export async function updateAvailableActions(id: string, availableActions: unknown) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/available-actions`, {
    method: 'PATCH',
    body: JSON.stringify({ availableActions }),
  })
}

export async function updateInitiativeRoll(id: string, initiativeRoll: number | null) {
  return fetchApi<{ ok: boolean }>(`/characters/${id}/initiative`, {
    method: 'PATCH',
    body: JSON.stringify({ initiativeRoll }),
  })
}
