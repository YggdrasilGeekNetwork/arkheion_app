import type { NPCVersion } from '~/types/encounter'

type NPCVersionSelectorProps = {
  versions: NPCVersion[]
  activeVersionId: string
  onChange: (versionId: string) => void
}

export default function NPCVersionSelector({ versions, activeVersionId, onChange }: NPCVersionSelectorProps) {
  if (versions.length <= 1) return null

  return (
    <div className="flex gap-1 flex-wrap">
      {versions.map(v => (
        <button
          key={v.id}
          onClick={(e) => { e.stopPropagation(); onChange(v.id) }}
          className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
            v.id === activeVersionId
              ? 'border-accent/50 bg-accent/20 text-accent'
              : 'border-stroke text-muted hover:text-fg'
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
