import { useMesa } from '~/contexts/MesaContext'
import type { MesaState } from '~/reducers/mesaReducer'

function getBreadcrumbItems(state: MesaState) {
  const items: { label: string; level: 'campaigns' | 'adventures' | 'sessions' | 'encounters' | 'encounter-detail' }[] = []

  const campaign = state.campaigns.find(c => c.id === state.activeCampaignId)
  if (campaign) {
    items.push({ label: campaign.name, level: 'adventures' })

    const adventure = campaign.adventures.find(a => a.id === state.activeAdventureId)
    if (adventure) {
      items.push({ label: adventure.name, level: 'sessions' })

      const session = adventure.sessions.find(s => s.id === state.activeSessionId)
      if (session) {
        items.push({ label: `S${session.number}`, level: 'encounters' })

        const encounter = session.encounters.find(e => e.id === state.activeEncounterId)
        if (encounter) {
          items.push({ label: encounter.name, level: 'encounter-detail' })
        }
      }
    }
  }

  return items
}

export default function EncounterBreadcrumb() {
  const { state, dispatch } = useMesa()

  const items = getBreadcrumbItems(state)
  if (items.length === 0) return null

  function handleClick(level: string) {
    // Navegar para o nível clicado resetando os níveis abaixo
    if (level === 'adventures') {
      dispatch({ type: 'SET_ACTIVE_ADVENTURE', payload: null })
    } else if (level === 'sessions') {
      dispatch({ type: 'SET_ACTIVE_SESSION', payload: null })
    } else if (level === 'encounters') {
      dispatch({ type: 'SET_ACTIVE_ENCOUNTER', payload: null })
    }
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-stroke flex-shrink-0 overflow-x-auto">
      <button
        onClick={() => dispatch({ type: 'NAVIGATE_BACK' })}
        className="text-xs text-muted hover:text-fg transition-colors flex-shrink-0"
      >
        ←
      </button>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-0.5 flex-shrink-0">
            {i > 0 && <span className="text-[10px] text-muted/40">›</span>}
            {isLast ? (
              <span className="text-[10px] font-medium text-fg truncate max-w-[80px]">{item.label}</span>
            ) : (
              <button
                onClick={() => handleClick(item.level)}
                className="text-[10px] text-muted hover:text-accent truncate max-w-[60px] transition-colors"
              >
                {item.label}
              </button>
            )}
          </span>
        )
      })}
    </div>
  )
}
