import { useState } from 'react'
import ToolsManager from '../tools/ToolsManager'

export default function CombatSidebarTools() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-stroke flex-shrink-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted hover:text-fg transition-colors"
      >
        <span>🎵 Ferramentas</span>
        <span className="text-[10px]">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="h-[300px] overflow-hidden">
          <ToolsManager compact />
        </div>
      )}
    </div>
  )
}
