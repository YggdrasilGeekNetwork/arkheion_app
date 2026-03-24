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

function canUpvote(status: string): boolean {
  return status !== 'done'
}

function partitionItems<T extends { status: string }>(items: T[]): { active: T[]; done: T[] } {
  return {
    active: items.filter((i) => i.status !== 'done'),
    done: items.filter((i) => i.status === 'done'),
  }
}

describe('canUpvote', () => {
  it('allows upvote for approved', () => {
    expect(canUpvote('approved')).toBe(true)
  })

  it('allows upvote for in_progress', () => {
    expect(canUpvote('in_progress')).toBe(true)
  })

  it('blocks upvote for done', () => {
    expect(canUpvote('done')).toBe(false)
  })
})

describe('partitionItems', () => {
  const items = [
    { id: '1', status: 'approved' },
    { id: '2', status: 'in_progress' },
    { id: '3', status: 'done' },
    { id: '4', status: 'done' },
  ]

  it('separates active from done', () => {
    const { active, done } = partitionItems(items)
    expect(active).toHaveLength(2)
    expect(done).toHaveLength(2)
  })

  it('active items do not include done status', () => {
    const { active } = partitionItems(items)
    expect(active.every((i) => i.status !== 'done')).toBe(true)
  })

  it('done items only have done status', () => {
    const { done } = partitionItems(items)
    expect(done.every((i) => i.status === 'done')).toBe(true)
  })

  it('returns empty arrays when no items', () => {
    const { active, done } = partitionItems([])
    expect(active).toHaveLength(0)
    expect(done).toHaveLength(0)
  })
})
