import { describe, it, expect } from 'vitest'

// Extracted logic from feedback.tsx for isolated testing

const STATUS_LABEL: Record<string, string> = {
  approved: 'Aprovado',
  in_progress: 'Em andamento',
  done: 'Concluído',
}

const STATUS_COLOR: Record<string, string> = {
  approved: 'text-blue-400 border-blue-400',
  in_progress: 'text-yellow-400 border-yellow-400',
  done: 'text-green-400 border-green-400',
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status
}

function statusColor(status: string): string {
  return STATUS_COLOR[status] ?? 'text-muted border-stroke'
}

function optimisticUpvoteCount(item: { upvotesCount: number; upvoted: boolean }, toggling: boolean): number {
  if (!toggling) return item.upvotesCount
  return item.upvotesCount + (item.upvoted ? -1 : 1)
}

function optimisticUpvotedState(item: { upvoted: boolean }, toggling: boolean): boolean {
  if (!toggling) return item.upvoted
  return !item.upvoted
}

describe('statusLabel', () => {
  it('approved → Aprovado', () => {
    expect(statusLabel('approved')).toBe('Aprovado')
  })

  it('in_progress → Em andamento', () => {
    expect(statusLabel('in_progress')).toBe('Em andamento')
  })

  it('done → Concluído', () => {
    expect(statusLabel('done')).toBe('Concluído')
  })

  it('unknown status falls back to raw value', () => {
    expect(statusLabel('pending')).toBe('pending')
  })
})

describe('statusColor', () => {
  it('approved returns blue classes', () => {
    expect(statusColor('approved')).toContain('blue')
  })

  it('in_progress returns yellow classes', () => {
    expect(statusColor('in_progress')).toContain('yellow')
  })

  it('done returns green classes', () => {
    expect(statusColor('done')).toContain('green')
  })

  it('unknown status returns muted fallback', () => {
    expect(statusColor('unknown')).toBe('text-muted border-stroke')
  })
})

describe('optimisticUpvoteCount', () => {
  it('returns current count when not toggling', () => {
    expect(optimisticUpvoteCount({ upvotesCount: 5, upvoted: false }, false)).toBe(5)
  })

  it('increments when adding upvote', () => {
    expect(optimisticUpvoteCount({ upvotesCount: 3, upvoted: false }, true)).toBe(4)
  })

  it('decrements when removing upvote', () => {
    expect(optimisticUpvoteCount({ upvotesCount: 3, upvoted: true }, true)).toBe(2)
  })
})

describe('optimisticUpvotedState', () => {
  it('returns current state when not toggling', () => {
    expect(optimisticUpvotedState({ upvoted: true }, false)).toBe(true)
    expect(optimisticUpvotedState({ upvoted: false }, false)).toBe(false)
  })

  it('flips state when toggling', () => {
    expect(optimisticUpvotedState({ upvoted: false }, true)).toBe(true)
    expect(optimisticUpvotedState({ upvoted: true }, true)).toBe(false)
  })
})
