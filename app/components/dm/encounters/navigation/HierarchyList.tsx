import { useState } from 'react'

type HierarchyItem = {
  id: string
  name: string
  description?: string
  subtitle?: string
}

type HierarchyListProps = {
  title: string
  icon: string
  items: HierarchyItem[]
  emptyMessage: string
  createLabel: string
  onSelect: (id: string) => void
  onCreate: (name: string) => void
  onDelete: (id: string) => void
  embedded?: boolean
}

export default function HierarchyList({
  title,
  icon,
  items,
  emptyMessage,
  createLabel,
  onSelect,
  onCreate,
  onDelete,
  embedded = false,
}: HierarchyListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    onCreate(name)
    setNewName('')
    setIsCreating(false)
  }

  return (
    <div className={embedded ? '' : 'h-full flex flex-col'}>
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-stroke flex-shrink-0">
        <span className="text-xs font-medium text-muted">{title}</span>
        <button
          onClick={() => setIsCreating(true)}
          className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
        >
          + {createLabel}
        </button>
      </div>

      <div className={`${embedded ? '' : 'flex-1 overflow-y-auto'} p-2 space-y-1.5`}>
        {isCreating && (
          <div className="bg-bg border border-accent/50 rounded-md p-2 space-y-1.5">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder={`Nome...`}
              autoFocus
              className="w-full bg-card border border-stroke rounded px-2 py-1 text-xs text-fg
                placeholder:text-muted/50 focus:outline-none focus:border-accent"
            />
            <div className="flex gap-1">
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 text-[10px] font-medium px-2 py-1 rounded
                  bg-accent text-card hover:bg-accent/80
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Criar
              </button>
              <button
                onClick={() => { setIsCreating(false); setNewName('') }}
                className="text-[10px] text-muted hover:text-fg px-2 py-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {items.length === 0 && !isCreating && (
          <div className={`${embedded ? 'py-6' : 'h-full'} flex flex-col items-center justify-center text-center p-4`}>
            <div className="text-3xl mb-2 opacity-50">{icon}</div>
            <div className="text-xs text-muted opacity-75 mb-3">{emptyMessage}</div>
            <button
              onClick={() => setIsCreating(true)}
              className="text-xs text-accent hover:text-accent/80 font-medium"
            >
              + {createLabel}
            </button>
          </div>
        )}

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full text-left bg-bg border border-stroke rounded-md p-2
              hover:border-accent/50 hover:bg-accent/5 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs text-fg truncate">{item.name}</div>
                {item.subtitle && (
                  <div className="text-[10px] text-muted mt-0.5">{item.subtitle}</div>
                )}
                {item.description && (
                  <div className="text-[10px] text-muted opacity-60 mt-0.5 line-clamp-1">{item.description}</div>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                className="text-muted hover:text-red-400 text-xs p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
