import { useState } from 'react'
import type { NoteLink } from '~/types/notes'
import { useMesa } from '~/contexts/MesaContext'

type NoteLinkModalProps = {
  noteId: string
  existingLinks: NoteLink[]
  onClose: () => void
}

type LinkTab = NoteLink['type']

const TABS: { type: LinkTab; icon: string; label: string }[] = [
  { type: 'campaign', icon: '🗺️', label: 'Campanha' },
  { type: 'adventure', icon: '📜', label: 'Aventura' },
  { type: 'session', icon: '📅', label: 'Sessão' },
  { type: 'encounter', icon: '⚔️', label: 'Encontro' },
]

export default function NoteLinkModal({ noteId, existingLinks, onClose }: NoteLinkModalProps) {
  const { state, dispatch } = useMesa()
  const [activeTab, setActiveTab] = useState<LinkTab>('campaign')

  const existingSet = new Set(existingLinks.map(l => `${l.type}:${l.id}`))

  function handleLink(link: NoteLink) {
    dispatch({ type: 'ADD_NOTE_LINK', payload: { noteId, link } })
  }

  function renderItems() {
    const campaign = state.campaigns.find(c => c.id === state.activeCampaignId)
    if (!campaign && activeTab !== 'campaign') {
      return <div className="text-[10px] text-muted py-2 text-center">Selecione uma campanha primeiro</div>
    }

    switch (activeTab) {
      case 'campaign':
        return state.campaigns.map(c => {
          const key = `campaign:${c.id}`
          const linked = existingSet.has(key)
          return (
            <LinkItem
              key={c.id}
              label={c.name}
              sublabel={c.description}
              linked={linked}
              onLink={() => handleLink({ type: 'campaign', id: c.id, label: c.name })}
            />
          )
        })
      case 'adventure':
        return campaign!.adventures.map(a => {
          const key = `adventure:${a.id}`
          const linked = existingSet.has(key)
          return (
            <LinkItem
              key={a.id}
              label={a.name}
              sublabel={a.description}
              linked={linked}
              onLink={() => handleLink({ type: 'adventure', id: a.id, label: a.name })}
            />
          )
        })
      case 'session':
        return campaign!.adventures.flatMap(a =>
          a.sessions.map(s => {
            const key = `session:${s.id}`
            const linked = existingSet.has(key)
            return (
              <LinkItem
                key={s.id}
                label={s.name}
                sublabel={`${a.name} · Sessão ${s.number}`}
                linked={linked}
                onLink={() => handleLink({ type: 'session', id: s.id, label: s.name })}
              />
            )
          })
        )
      case 'encounter':
        return campaign!.adventures.flatMap(a =>
          a.sessions.flatMap(s =>
            s.encounters.map(e => {
              const key = `encounter:${e.id}`
              const linked = existingSet.has(key)
              return (
                <LinkItem
                  key={e.id}
                  label={e.name}
                  sublabel={`${a.name} · ${s.name}`}
                  linked={linked}
                  onLink={() => handleLink({ type: 'encounter', id: e.id, label: e.name })}
                />
              )
            })
          )
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-bg border border-stroke rounded-lg w-80 max-h-[400px] flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-stroke">
          <span className="text-xs font-medium text-fg">Vincular nota</span>
          <button onClick={onClose} className="text-muted hover:text-fg text-xs">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stroke flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] transition-colors
                ${activeTab === tab.type
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-fg'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {renderItems()}
        </div>
      </div>
    </div>
  )
}

function LinkItem({
  label,
  sublabel,
  linked,
  onLink,
}: {
  label: string
  sublabel?: string
  linked: boolean
  onLink: () => void
}) {
  return (
    <button
      onClick={linked ? undefined : onLink}
      disabled={linked}
      className={`w-full text-left px-2 py-1.5 rounded transition-colors
        ${linked
          ? 'bg-green-600/10 border border-green-500/20 opacity-60 cursor-default'
          : 'bg-surface/50 border border-stroke hover:border-accent/30 hover:bg-surface'
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-fg">{label}</span>
        {linked && <span className="text-[9px] text-green-400">vinculada</span>}
      </div>
      {sublabel && (
        <span className="text-[9px] text-muted line-clamp-1">{sublabel}</span>
      )}
    </button>
  )
}
