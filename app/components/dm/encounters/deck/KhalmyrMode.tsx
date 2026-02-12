import { useState } from 'react'
import type { Card, CardType, Adventure } from '~/types/encounter'
import { CARD_TYPE_INFO, THREAT_TIERS } from '~/types/encounter'
import { ADVENTURE_DECK } from '~/data/adventureDeck'
import { useMesa } from '~/contexts/MesaContext'
import { createDrawnCard, createCustomCard } from '../utils/deckHelpers'

type KhalmyrModeProps = {
  adventure: Adventure
}

const ALL_TYPES: CardType[] = ['plot', 'location', 'character', 'object', 'threat', 'event']

export default function KhalmyrMode({ adventure }: KhalmyrModeProps) {
  const { dispatch } = useMesa()
  const [browsingType, setBrowsingType] = useState<CardType>('plot')
  const [threatTierFilter, setThreatTierFilter] = useState<number | null>(null)
  const [staged, setStaged] = useState<Card[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [customType, setCustomType] = useState<CardType>('plot')

  const drawnIds = new Set((adventure.drawnCards ?? []).map(c => c.id))
  const stagedIds = new Set(staged.map(c => c.id))

  let cards: Card[] = ADVENTURE_DECK[browsingType] || []
  if (browsingType === 'threat' && threatTierFilter) {
    cards = cards.filter(c => c.tier === threatTierFilter)
  }

  function toggleStaged(card: Card) {
    setStaged(prev =>
      prev.some(c => c.id === card.id)
        ? prev.filter(c => c.id !== card.id)
        : [...prev, card]
    )
  }

  function handleConfirm() {
    for (const card of staged) {
      const drawn = createDrawnCard(card, 'khalmyr')
      if (card.id.startsWith('custom-')) {
        drawn.isCustom = true
      }
      dispatch({
        type: 'ADD_CARD_TO_ADVENTURE',
        payload: { card: drawn },
      })
    }
    setStaged([])
  }

  function handleAddCustom() {
    if (!customName.trim()) return
    const card = createCustomCard(customType, customName.trim(), customDesc.trim())
    setStaged(prev => [...prev, card])
    setCustomName('')
    setCustomDesc('')
    setShowCustomForm(false)
  }

  function getCardStatus(card: Card): 'in-adventure' | 'staged' | 'available' {
    if (drawnIds.has(card.id)) return 'in-adventure'
    if (stagedIds.has(card.id)) return 'staged'
    return 'available'
  }

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Tabs de tipo */}
      <div className="flex gap-0.5 flex-wrap flex-shrink-0">
        {ALL_TYPES.map(type => {
          const info = CARD_TYPE_INFO[type]
          const isActive = browsingType === type
          return (
            <button
              key={type}
              onClick={() => setBrowsingType(type)}
              className={`
                flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-colors
                ${isActive
                  ? 'bg-amber-600/20 border border-amber-500/50 text-amber-300'
                  : 'bg-bg border border-stroke text-muted hover:border-amber-500/30'
                }
              `}
            >
              <span>{info.icon}</span>
              <span>{info.labelPt}</span>
            </button>
          )
        })}
      </div>

      {/* Filtro de tier */}
      {browsingType === 'threat' && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => setThreatTierFilter(null)}
            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
              !threatTierFilter ? 'bg-red-600/20 border border-red-500/50 text-red-300' : 'bg-bg border border-stroke text-muted'
            }`}
          >
            Todos
          </button>
          {THREAT_TIERS.map((tier, i) => (
            <button
              key={tier.id}
              onClick={() => setThreatTierFilter(i + 1)}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                threatTierFilter === i + 1 ? 'bg-red-600/20 border border-red-500/50 text-red-300' : 'bg-bg border border-stroke text-muted'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      )}

      {/* Botão criar carta customizada */}
      <div className="flex-shrink-0">
        {!showCustomForm ? (
          <button
            onClick={() => { setShowCustomForm(true); setCustomType(browsingType) }}
            className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px]
              bg-bg border border-dashed border-stroke text-muted
              hover:border-amber-500/40 hover:text-amber-300 transition-colors"
          >
            <span>+</span>
            <span>Criar carta customizada</span>
          </button>
        ) : (
          <div className="bg-bg border border-amber-500/30 rounded-md p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-amber-300">Nova carta</span>
              <button
                onClick={() => setShowCustomForm(false)}
                className="text-[10px] text-muted hover:text-fg"
              >
                ✕
              </button>
            </div>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as CardType)}
              className="w-full bg-surface border border-stroke rounded px-1.5 py-1 text-[10px] text-fg"
            >
              {ALL_TYPES.map(type => (
                <option key={type} value={type}>
                  {CARD_TYPE_INFO[type].icon} {CARD_TYPE_INFO[type].labelPt}
                </option>
              ))}
            </select>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nome da carta"
              className="w-full bg-surface border border-stroke rounded px-1.5 py-1 text-[10px] text-fg placeholder:text-muted/50"
            />
            <textarea
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={2}
              className="w-full bg-surface border border-stroke rounded px-1.5 py-1 text-[10px] text-fg placeholder:text-muted/50 resize-none"
            />
            <button
              onClick={handleAddCustom}
              disabled={!customName.trim()}
              className="w-full px-2 py-1 rounded text-[10px] font-medium
                bg-amber-600/20 border border-amber-500/50 text-amber-300
                hover:bg-amber-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Adicionar ao staging
            </button>
          </div>
        )}
      </div>

      {/* Lista de cartas */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {cards.map(card => {
          const status = getCardStatus(card)
          return (
            <button
              key={card.id}
              onClick={() => status !== 'in-adventure' && toggleStaged(card)}
              disabled={status === 'in-adventure'}
              className={`
                w-full text-left flex items-start gap-2 p-2 rounded-md border transition-colors
                ${status === 'in-adventure'
                  ? 'bg-green-600/10 border-green-500/20 opacity-50 cursor-not-allowed'
                  : status === 'staged'
                    ? 'bg-amber-600/15 border-amber-500/40'
                    : 'bg-bg border-stroke hover:border-amber-500/20'
                }
              `}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-xs text-fg">{card.name}</span>
                  {status === 'in-adventure' && (
                    <span className="text-[9px] text-green-400">na aventura</span>
                  )}
                </div>
                <p className="text-[10px] text-muted leading-relaxed line-clamp-2">{card.description}</p>
                {card.subcategory && (
                  <span className="text-[10px] text-muted opacity-60">
                    {card.subcategory}{card.tier ? ` · Tier ${card.tier}` : ''}
                  </span>
                )}
              </div>
              {status === 'staged' && (
                <span className="flex-shrink-0 text-amber-300 text-xs">✓</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Barra de confirmação */}
      {staged.length > 0 && (
        <div className="flex gap-2 flex-shrink-0 pt-1 border-t border-stroke">
          <button
            onClick={handleConfirm}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium
              bg-green-600/20 border border-green-500/50 text-green-300
              hover:bg-green-600/30 transition-colors"
          >
            Adicionar {staged.length} carta{staged.length !== 1 ? 's' : ''}
          </button>
          <button
            onClick={() => setStaged([])}
            className="px-3 py-1.5 rounded-md text-xs text-muted hover:text-fg transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
