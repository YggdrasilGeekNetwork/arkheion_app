import { useState } from 'react'
import type { Adventure } from '~/types/encounter'
import NimbMode from '../deck/NimbMode'
import KhalmyrMode from '../deck/KhalmyrMode'
import AdventureSummary from '../deck/AdventureSummary'

type AdventureDeckTabProps = {
  adventure: Adventure
}

type DeckMode = 'nimb' | 'khalmyr'

export default function AdventureDeckTab({ adventure }: AdventureDeckTabProps) {
  const [mode, setMode] = useState<DeckMode>('nimb')

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Seletor de modo */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => setMode('nimb')}
          className={`
            flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors
            ${mode === 'nimb'
              ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300'
              : 'bg-bg border border-stroke text-muted hover:border-purple-500/30'
            }
          `}
        >
          <span>🎲</span> Nimb
        </button>
        <button
          onClick={() => setMode('khalmyr')}
          className={`
            flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors
            ${mode === 'khalmyr'
              ? 'bg-amber-600/20 border border-amber-500/50 text-amber-300'
              : 'bg-bg border border-stroke text-muted hover:border-amber-500/30'
            }
          `}
        >
          <span>⚖️</span> Khalmyr
        </button>
      </div>

      {/* Modo ativo */}
      <div className="flex-1 overflow-hidden">
        {mode === 'nimb' && <NimbMode adventure={adventure} />}
        {mode === 'khalmyr' && <KhalmyrMode adventure={adventure} />}
      </div>

      {/* Resumo da aventura */}
      <div className="flex-shrink-0 border-t border-stroke pt-2">
        <AdventureSummary adventure={adventure} />
      </div>
    </div>
  )
}
