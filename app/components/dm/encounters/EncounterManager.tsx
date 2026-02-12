import { useState, useMemo, useCallback } from 'react'
import type { EncounterTab } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import { getActiveEncounter } from '~/reducers/mesaReducer'
import HierarchyList from './navigation/HierarchyList'
import HierarchySummary from './navigation/HierarchySummary'
import EncounterBreadcrumb from './navigation/EncounterBreadcrumb'
import EncounterBookmarks from './EncounterBookmarks'
import AdventureDeckTab from './tabs/AdventureDeckTab'
import EnemiesTab from './tabs/EnemiesTab'
import NPCGeneratorTab from './tabs/NPCGeneratorTab'
import ObjectsTab from './tabs/ObjectsTab'
import NotesTab from './tabs/NotesTab'
import RewardsTab from './tabs/RewardsTab'
import {
  collectFromCampaign,
  collectFromAdventure,
  collectFromSession,
  aggregateEncounters,
} from './utils/hierarchyHelpers'
import type { EncounterPath } from './utils/hierarchyHelpers'

type AdventureView = 'sessions' | 'deck'

export default function EncounterManager() {
  const { state, dispatch } = useMesa()
  const [activeTab, setActiveTab] = useState<EncounterTab>('enemies')
  const [adventureView, setAdventureView] = useState<AdventureView>('sessions')

  const {
    campaigns,
    activeCampaignId,
    activeAdventureId,
    activeSessionId,
    activeEncounterId,
  } = state

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId)
  const activeAdventure = activeCampaign?.adventures.find(a => a.id === activeAdventureId)
  const activeSession = activeAdventure?.sessions.find(s => s.id === activeSessionId)
  const activeEncounter = getActiveEncounter(state)

  // Dados agregados por nível
  const campaignAggregated = useMemo(
    () => activeCampaign ? aggregateEncounters(collectFromCampaign(activeCampaign), activeCampaign, activeCampaign.adventures) : null,
    [activeCampaign]
  )
  const adventureAggregated = useMemo(
    () => {
      if (!activeCampaign || !activeAdventureId) return null
      const adventure = activeCampaign.adventures.find(a => a.id === activeAdventureId)
      return aggregateEncounters(
        collectFromAdventure(activeCampaign, activeAdventureId),
        activeCampaign,
        adventure ? [adventure] : [],
      )
    },
    [activeCampaign, activeAdventureId]
  )
  const sessionAggregated = useMemo(
    () => activeCampaign && activeAdventureId && activeSessionId
      ? aggregateEncounters(collectFromSession(activeCampaign, activeAdventureId, activeSessionId), activeCampaign)
      : null,
    [activeCampaign, activeAdventureId, activeSessionId]
  )

  // Navegar diretamente para um encontro via path
  const navigateToEncounter = useCallback((path: EncounterPath) => {
    dispatch({
      type: 'NAVIGATE_TO_ENCOUNTER',
      payload: {
        adventureId: path.adventureId,
        sessionId: path.sessionId,
        encounterId: path.encounterId,
      },
    })
  }, [dispatch])

  // Nível 1: Lista de campanhas
  if (!activeCampaignId) {
    return (
      <HierarchyList
        title="Campanhas"
        icon="🗺️"
        items={campaigns.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          subtitle: `${c.adventures.length} aventura${c.adventures.length !== 1 ? 's' : ''}`,
        }))}
        emptyMessage="Crie uma campanha para organizar suas aventuras"
        createLabel="Campanha"
        onSelect={(id) => dispatch({ type: 'SET_ACTIVE_CAMPAIGN', payload: id })}
        onCreate={(name) => dispatch({ type: 'CREATE_CAMPAIGN', payload: { name } })}
        onDelete={(id) => dispatch({ type: 'DELETE_CAMPAIGN', payload: id })}
      />
    )
  }

  // Nível 2: Lista de aventuras (dentro de campanha)
  if (!activeAdventureId && activeCampaign) {
    return (
      <div className="h-full flex flex-col">
        <EncounterBreadcrumb />
        <div className="flex-1 overflow-y-auto">
          <HierarchyList
            embedded
            title="Aventuras"
            icon="📜"
            items={activeCampaign.adventures.map(a => ({
              id: a.id,
              name: a.name,
              description: a.description,
              subtitle: `${a.sessions.length} sessão${a.sessions.length !== 1 ? 'ões' : ''} · ${(a.drawnCards ?? []).length} carta${(a.drawnCards ?? []).length !== 1 ? 's' : ''}`,
            }))}
            emptyMessage="Crie uma aventura para esta campanha"
            createLabel="Aventura"
            onSelect={(id) => dispatch({ type: 'SET_ACTIVE_ADVENTURE', payload: id })}
            onCreate={(name) => dispatch({ type: 'CREATE_ADVENTURE', payload: { name } })}
            onDelete={(id) => dispatch({ type: 'DELETE_ADVENTURE', payload: id })}
          />
          {campaignAggregated && (
            <HierarchySummary data={campaignAggregated} onNavigate={navigateToEncounter} />
          )}
        </div>
      </div>
    )
  }

  // Nível 3: Aventura ativa (sessões + baralho)
  if (!activeSessionId && activeAdventure) {
    const nextNumber = activeAdventure.sessions.length + 1
    return (
      <div className="h-full flex flex-col">
        <EncounterBreadcrumb />

        {/* Tabs: Sessões / Baralho */}
        <div className="flex border-b border-stroke flex-shrink-0">
          <button
            onClick={() => setAdventureView('sessions')}
            className={`
              flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors
              border-b-2 -mb-px
              ${adventureView === 'sessions'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-fg hover:border-stroke'
              }
            `}
          >
            <span>📅</span>
            <span>Sessões</span>
          </button>
          <button
            onClick={() => setAdventureView('deck')}
            className={`
              flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors
              border-b-2 -mb-px
              ${adventureView === 'deck'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-fg hover:border-stroke'
              }
            `}
          >
            <span>📖</span>
            <span>Baralho</span>
            {(activeAdventure.drawnCards ?? []).length > 0 && (
              <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                {(activeAdventure.drawnCards ?? []).length}
              </span>
            )}
          </button>
        </div>

        {adventureView === 'deck' ? (
          <div className="flex-1 overflow-hidden p-2">
            <AdventureDeckTab adventure={activeAdventure} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <HierarchyList
              embedded
              title="Sessões"
              icon="📅"
              items={activeAdventure.sessions.map(s => ({
                id: s.id,
                name: s.name,
                subtitle: `Sessão ${s.number} · ${s.encounters.length} encontro${s.encounters.length !== 1 ? 's' : ''}`,
              }))}
              emptyMessage="Crie uma sessão para esta aventura"
              createLabel="Sessão"
              onSelect={(id) => dispatch({ type: 'SET_ACTIVE_SESSION', payload: id })}
              onCreate={(name) => dispatch({ type: 'CREATE_SESSION', payload: { name, number: nextNumber } })}
              onDelete={(id) => dispatch({ type: 'DELETE_SESSION', payload: id })}
            />
            {adventureAggregated && (
              <HierarchySummary data={adventureAggregated} onNavigate={(path) => {
                dispatch({
                  type: 'NAVIGATE_TO_ENCOUNTER',
                  payload: {
                    adventureId: path.adventureId,
                    sessionId: path.sessionId,
                    encounterId: path.encounterId,
                  },
                })
              }} />
            )}
          </div>
        )}
      </div>
    )
  }

  // Nível 4: Lista de encontros (dentro de sessão)
  if (!activeEncounterId && activeSession) {
    return (
      <div className="h-full flex flex-col">
        <EncounterBreadcrumb />
        <div className="flex-1 overflow-y-auto">
          <HierarchyList
            embedded
            title="Encontros"
            icon="👹"
            items={activeSession.encounters.map(e => ({
              id: e.id,
              name: e.name,
              description: e.description,
              subtitle: `${(e.enemies?.length ?? 0)} inimigo${(e.enemies?.length ?? 0) !== 1 ? 's' : ''} · ${e.status === 'draft' ? 'Rascunho' : e.status === 'ready' ? 'Pronto' : e.status === 'active' ? 'Em combate' : 'Concluído'}`,
            }))}
            emptyMessage="Crie um encontro para esta sessão"
            createLabel="Encontro"
            onSelect={(id) => dispatch({ type: 'SET_ACTIVE_ENCOUNTER', payload: id })}
            onCreate={(name) => dispatch({ type: 'CREATE_ENCOUNTER', payload: { name } })}
            onDelete={(id) => dispatch({ type: 'DELETE_ENCOUNTER', payload: id })}
          />
          {sessionAggregated && (
            <HierarchySummary data={sessionAggregated} onNavigate={(path) => {
              dispatch({ type: 'SET_ACTIVE_ENCOUNTER', payload: path.encounterId })
            }} />
          )}
        </div>
      </div>
    )
  }

  // Nível 5: Encontro ativo
  if (!activeEncounter) return null

  return (
    <div className="h-full flex flex-col">
      <EncounterBreadcrumb />
      <EncounterBookmarks activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-hidden p-2">
        {activeTab === 'enemies' && <EnemiesTab encounter={activeEncounter} />}
        {activeTab === 'npcs' && <NPCGeneratorTab encounter={activeEncounter} />}
        {activeTab === 'objects' && <ObjectsTab encounter={activeEncounter} />}
        {activeTab === 'notes' && <NotesTab encounterId={activeEncounter.id} encounterName={activeEncounter.name} />}
        {activeTab === 'rewards' && <RewardsTab encounter={activeEncounter} />}
      </div>
    </div>
  )
}
