import { useState } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import CombatTopBar from './CombatTopBar'
import CombatSidebarTools from './CombatSidebarTools'
import CombatSidebarEncounter from './CombatSidebarEncounter'
import InitiativeTracker from './InitiativeTracker'
import CombatSidebarNotes from './CombatSidebarNotes'
import VTTPlaceholder from './VTTPlaceholder'

type CombatModeLayoutProps = {
  mesaName: string
  onBack?: () => void
  onShowDashboard?: () => void
  emitCombatEnd: () => void
}

export default function CombatModeLayout({ mesaName, onBack, onShowDashboard, emitCombatEnd }: CombatModeLayoutProps) {
  const { dispatch } = useMesa()
  const [showConfirm, setShowConfirm] = useState(false)

  function handleEndCombat() {
    setShowConfirm(true)
  }

  function confirmEnd() {
    emitCombatEnd()
    dispatch({ type: 'END_COMBAT' })
    setShowConfirm(false)
  }

  return (
    <div className="w-full h-[100dvh] bg-bg flex flex-col">
      <CombatTopBar mesaName={mesaName} onEndCombat={handleEndCombat} onShowDashboard={onShowDashboard} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[300px] flex-shrink-0 border-r border-stroke flex flex-col overflow-hidden bg-card">
          <CombatSidebarTools />
          <CombatSidebarEncounter />
          <InitiativeTracker />
          <CombatSidebarNotes />
        </div>

        {/* Main area - VTT */}
        <VTTPlaceholder />
      </div>

      {/* End combat confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-stroke rounded-lg p-4 max-w-sm mx-4">
            <h3 className="text-sm font-bold text-fg mb-2">Encerrar Combate?</h3>
            <p className="text-xs text-muted mb-4">
              Os dados de iniciativa serao perdidos. O encontro sera marcado como concluido.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-xs text-muted hover:text-fg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEnd}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600
                  rounded hover:bg-red-700 transition-colors"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
