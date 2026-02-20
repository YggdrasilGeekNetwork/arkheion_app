import { useState } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import { useCombatSocket } from '~/hooks/useCombatSocket'
import { useAudioEngine } from './tools/soundboard/useAudioEngine'
import { AudioEngineProvider } from '~/contexts/AudioEngineContext'
import DMTopBar from './DMTopBar'
import EncounterManager from './encounters/EncounterManager'
import NotesManager from './notes/NotesManager'
import PartySnapshot from './quadrants/PartySnapshot'
import QuadrantContainer from './quadrants/QuadrantContainer'
import ToolsManager from './tools/ToolsManager'
import CombatModeLayout from './combat/CombatModeLayout'

type DMDashboardProps = {
  onBack?: () => void
}

export default function DMDashboard({ onBack }: DMDashboardProps) {
  const { state } = useMesa()
  const { mesa, isLoading } = state
  const [showDashboard, setShowDashboard] = useState(false)

  // Keep socket listeners active even when switching between combat and dashboard views
  const { emitCombatEnd } = useCombatSocket()

  // Audio engine lives here so it persists across combat ↔ dashboard switches
  const audioEngine = useAudioEngine()

  if (isLoading) {
    return (
      <div className="w-full h-[100dvh] bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎲</div>
          <div className="text-xl font-bold mb-2">Carregando mesa...</div>
        </div>
      </div>
    )
  }

  if (!mesa) {
    return (
      <div className="w-full h-[100dvh] bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl font-bold mb-2">Mesa não encontrada</div>
        </div>
      </div>
    )
  }

  if (state.combatState && !showDashboard) {
    return (
      <AudioEngineProvider value={audioEngine}>
        <CombatModeLayout
          mesaName={mesa.name}
          onBack={onBack}
          onShowDashboard={() => setShowDashboard(true)}
          emitCombatEnd={emitCombatEnd}
        />
      </AudioEngineProvider>
    )
  }

  return (
    <AudioEngineProvider value={audioEngine}>
      <div className="w-full h-[100dvh] bg-bg flex flex-col">
        <DMTopBar mesaName={mesa.name} onBack={onBack} />

        {/* Combat active banner */}
        {state.combatState && showDashboard && (
          <button
            onClick={() => setShowDashboard(false)}
            className="mx-2 px-3 py-1.5 bg-red-600/20 border border-red-500/40 rounded-lg
              flex items-center justify-center gap-2 text-xs font-semibold text-red-300
              hover:bg-red-600/30 transition-colors"
          >
            <span>⚔️</span>
            <span>Combate em andamento — Rodada {state.combatState.round}</span>
            <span className="text-[10px] bg-red-500/30 px-1.5 py-0.5 rounded-full">
              Voltar ao Combate
            </span>
          </button>
        )}

        {/* 2x2 Grid Dashboard */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 p-2 overflow-hidden">
          {/* Top-Left Quadrant - Ferramentas */}
          <QuadrantContainer title="Ferramentas" position="top-left">
            <ToolsManager />
          </QuadrantContainer>

          {/* Top-Right Quadrant - Party Snapshot */}
          <QuadrantContainer title="Grupo" position="top-right">
            <PartySnapshot characters={mesa.characters} />
          </QuadrantContainer>

          {/* Bottom-Left Quadrant - Notes */}
          <QuadrantContainer title="Notas" position="bottom-left">
            <NotesManager />
          </QuadrantContainer>

          {/* Bottom-Right Quadrant - Encounter Manager */}
          <QuadrantContainer title="Encontros" position="bottom-right">
            <EncounterManager onGoToCombat={() => setShowDashboard(false)} />
          </QuadrantContainer>
        </div>
      </div>
    </AudioEngineProvider>
  )
}
