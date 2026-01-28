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
