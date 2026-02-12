import type { EncounterTab } from '~/types/encounter'
import { ENCOUNTER_TABS } from '~/types/encounter'

type EncounterBookmarksProps = {
  activeTab: EncounterTab
  onTabChange: (tab: EncounterTab) => void
}

export default function EncounterBookmarks({ activeTab, onTabChange }: EncounterBookmarksProps) {
  return (
    <div className="flex border-b border-stroke flex-shrink-0">
      {ENCOUNTER_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors
            border-b-2 -mb-px
            ${activeTab === tab.id
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-fg hover:border-stroke'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
