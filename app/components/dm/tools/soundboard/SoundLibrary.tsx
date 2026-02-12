import { useState } from 'react'
import { SOUND_LIBRARY, SOUND_CATEGORIES } from '~/data/soundEffects'
import type { SoundCategory, CustomSound, SoundDefinition } from '~/types/soundboard'
import SoundLibraryItem from './SoundLibraryItem'
import AddCustomSoundModal from './AddCustomSoundModal'

type SoundLibraryProps = {
  customSounds: CustomSound[]
  boardSoundIds: Set<string>
  onAddToBoard: (soundId: string, isCustom: boolean) => void
  onAddCustomSound: (sound: CustomSound) => void
  onRemoveCustomSound: (id: string) => void
}

export default function SoundLibrary({
  customSounds, boardSoundIds, onAddToBoard, onAddCustomSound, onRemoveCustomSound,
}: SoundLibraryProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<SoundCategory | null>(null)
  const [showAddCustom, setShowAddCustom] = useState(false)

  const allSounds: (SoundDefinition & { isCustom: boolean })[] = [
    ...SOUND_LIBRARY.map(s => ({ ...s, isCustom: false })),
    ...customSounds.map(s => ({
      id: s.id, name: s.name, category: s.category, icon: s.icon,
      loop: s.loop, variants: [{ id: s.id, url: s.url }], isCustom: true,
    })),
  ]

  const filtered = allSounds
    .filter(s => !categoryFilter || s.category === categoryFilter)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-stroke pr-1.5">
      <div className="text-[11px] text-muted uppercase tracking-wider font-medium mb-1">
        Biblioteca
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar..."
        className="w-full bg-surface/50 border border-stroke rounded px-1.5 py-0.5
          text-xs text-fg placeholder:text-muted/40 outline-none
          focus:border-accent/40 transition-colors mb-1 flex-shrink-0"
      />

      {/* Category chips */}
      <div className="flex gap-0.5 flex-wrap mb-1 flex-shrink-0">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-1 py-0.5 rounded text-[10px] transition-colors
            ${!categoryFilter
              ? 'bg-accent/20 text-accent border border-accent/40'
              : 'bg-surface/50 text-muted border border-stroke hover:border-accent/30'
            }`}
        >
          Todos
        </button>
        {SOUND_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
            className={`px-1 py-0.5 rounded text-[10px] transition-colors
              ${categoryFilter === cat.id
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-surface/50 text-muted border border-stroke hover:border-accent/30'
              }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Sound list */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-px">
        {filtered.map(sound => (
          <SoundLibraryItem
            key={sound.id}
            sound={sound}
            isOnBoard={boardSoundIds.has(sound.id)}
            onAdd={() => onAddToBoard(sound.id, sound.isCustom)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-xs text-muted/50 text-center py-2">
            Nenhum som encontrado
          </div>
        )}

        {/* Custom sounds section */}
        {customSounds.length > 0 && !categoryFilter && !search && (
          <div className="mt-2 pt-1 border-t border-stroke/50">
            <div className="text-[10px] text-muted/50 uppercase mb-0.5">Personalizados</div>
            {customSounds.map(s => (
              <div key={s.id} className="flex items-center gap-1 px-1.5 py-0.5 group">
                <span className="text-sm">{s.icon}</span>
                <span className="flex-1 text-xs text-fg truncate">{s.name}</span>
                <button
                  onClick={() => onRemoveCustomSound(s.id)}
                  className="text-[10px] text-red-400/50 hover:text-red-400
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add custom sound */}
      <div className="flex-shrink-0 mt-1">
        {showAddCustom ? (
          <AddCustomSoundModal
            onAdd={onAddCustomSound}
            onClose={() => setShowAddCustom(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddCustom(true)}
            className="w-full text-xs text-accent hover:text-accent/80
              border border-dashed border-accent/30 rounded py-1
              hover:bg-accent/5 transition-colors"
          >
            + Adicionar Som
          </button>
        )}
      </div>
    </div>
  )
}
