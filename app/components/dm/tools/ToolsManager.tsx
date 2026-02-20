import { useState } from 'react'
import RulesTab from './RulesTab'
import NameGeneratorTab from './NameGeneratorTab'
import SoundboardTab from './SoundboardTab'
import { useAudioEngine } from './soundboard/useAudioEngine'

type ToolTab = 'rules' | 'names' | 'soundboard'

const TOOL_TABS: { id: ToolTab; icon: string; label: string }[] = [
  { id: 'rules', icon: '📖', label: 'Regras' },
  { id: 'names', icon: '📛', label: 'Nomes' },
  { id: 'soundboard', icon: '🎵', label: 'Soundboard' },
]

type ToolsManagerProps = {
  compact?: boolean
}

export default function ToolsManager({ compact = false }: ToolsManagerProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>(compact ? 'soundboard' : 'rules')
  // Audio engine lives here so it persists across tab switches
  const audioEngine = useAudioEngine()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-stroke flex-shrink-0">
        {TOOL_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
            {tab.id === 'soundboard' && audioEngine.activeSounds.size > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content — soundboard always mounted so iframes persist */}
      <div className={`flex-1 overflow-hidden p-2 ${activeTab === 'rules' ? '' : 'hidden'}`}>
        <RulesTab />
      </div>
      <div className={`flex-1 overflow-hidden p-2 ${activeTab === 'names' ? '' : 'hidden'}`}>
        <NameGeneratorTab />
      </div>
      <div className={`flex-1 overflow-hidden p-2 ${activeTab === 'soundboard' ? '' : 'hidden'}`}>
        <SoundboardTab audioEngine={audioEngine} compact={compact} />
      </div>
    </div>
  )
}
