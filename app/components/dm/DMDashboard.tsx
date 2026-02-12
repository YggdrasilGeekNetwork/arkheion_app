import { useMesa } from '~/contexts/MesaContext'
import DMTopBar from './DMTopBar'
import EncounterManager from './encounters/EncounterManager'
import NotesManager from './notes/NotesManager'
import PartySnapshot from './quadrants/PartySnapshot'
import PlaceholderQuadrant from './quadrants/PlaceholderQuadrant'
import QuadrantContainer from './quadrants/QuadrantContainer'

type DMDashboardProps = {
  onBack?: () => void
}

export default function DMDashboard({ onBack }: DMDashboardProps) {
  const { state } = useMesa()
  const { mesa, isLoading } = state

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

  return (
    <div className="w-full h-[100dvh] bg-bg flex flex-col">
      <DMTopBar mesaName={mesa.name} onBack={onBack} />

      {/* 2x2 Grid Dashboard */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 p-2 overflow-hidden">
        {/* Top-Left Quadrant - Referência Rápida */}
        <QuadrantContainer title="Referência" position="top-left">
          <PlaceholderQuadrant
            icon="📚"
            title="Referência Rápida"
            description="Em breve: tabelas e regras rápidas"
          />
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
          <EncounterManager />
        </QuadrantContainer>
      </div>
    </div>
  )
}
