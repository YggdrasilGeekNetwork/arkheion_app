import { useState } from 'react'
import type { Encounter } from '~/types/encounter'

type EncounterListProps = {
  encounters: Encounter[]
  onSelect: (id: string) => void
  onCreate: (name: string) => void
  onDelete: (id: string) => void
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'text-muted' },
  ready: { label: 'Pronto', color: 'text-blue-400' },
  active: { label: 'Em combate', color: 'text-red-400' },
  completed: { label: 'Concluído', color: 'text-green-400' },
}

export default function EncounterList({ encounters, onSelect, onCreate, onDelete }: EncounterListProps) {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-stroke flex-shrink-0">
        <span className="text-xs font-medium text-muted">Encontros</span>
        <button
          onClick={() => setIsCreating(true)}
          className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
        >
          + Novo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {/* Formulário de criação */}
        {isCreating && (
          <div className="bg-bg border border-accent/50 rounded-md p-2 space-y-1.5">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nome do encontro..."
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

        {/* Lista de encontros */}
        {encounters.length === 0 && !isCreating && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="text-3xl mb-2 opacity-50">👹</div>
            <div className="font-semibold text-muted text-sm mb-1">Nenhum encontro</div>
            <div className="text-xs text-muted opacity-75 mb-3">Crie um encontro para começar a montar seu baralho</div>
            <button
              onClick={() => setIsCreating(true)}
              className="text-xs text-accent hover:text-accent/80 font-medium"
            >
              + Criar encontro
            </button>
          </div>
        )}

        {encounters.map((encounter) => {
          const statusInfo = STATUS_LABELS[encounter.status] ?? STATUS_LABELS.draft
          return (
            <button
              key={encounter.id}
              onClick={() => onSelect(encounter.id)}
              className="w-full text-left bg-bg border border-stroke rounded-md p-2
                hover:border-accent/50 hover:bg-accent/5 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-fg truncate">{encounter.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] ${statusInfo.color}`}>{statusInfo.label}</span>
                    <span className="text-[10px] text-muted">
                      {(encounter.enemies?.length ?? 0)} inimigo{(encounter.enemies?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(encounter.id) }}
                  className="text-muted hover:text-red-400 text-xs p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
