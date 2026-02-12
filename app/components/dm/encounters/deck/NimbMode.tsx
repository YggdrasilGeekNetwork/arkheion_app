import { useState } from 'react'
import type { Card, CardType, Adventure } from '~/types/encounter'
import { CARD_TYPE_INFO, THREAT_TIERS } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import { drawRandomCard, drawRandomThreat, createDrawnCard } from '../utils/deckHelpers'

type NimbModeProps = {
  adventure: Adventure
}

const ALL_TYPES: CardType[] = ['plot', 'location', 'character', 'object', 'threat', 'event']

export default function NimbMode({ adventure }: NimbModeProps) {
  const { dispatch } = useMesa()
  const [selectedTypes, setSelectedTypes] = useState<Set<CardType>>(new Set(ALL_TYPES))
  const [selectedTier, setSelectedTier] = useState<number>(1)
  const [preview, setPreview] = useState<Card[] | null>(null)

  function toggleType(type: CardType) {
    setSelectedTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function handleGenerate() {
    if (selectedTypes.size === 0) return

    const existingIds = (adventure.drawnCards ?? []).map(c => c.id)
    const generated: Card[] = []

    for (const type of selectedTypes) {
      const card = type === 'threat' && selectedTier
        ? drawRandomThreat(selectedTier, existingIds)
        : drawRandomCard(type, existingIds)

      if (card) {
        generated.push(card)
        existingIds.push(card.id)
      }
    }

    setPreview(generated)
  }

  function handleConfirm() {
    if (!preview) return
    for (const card of preview) {
      dispatch({
        type: 'ADD_CARD_TO_ADVENTURE',
        payload: { card: createDrawnCard(card, 'nimb') },
      })
    }
    setPreview(null)
  }

  function handleReroll() {
    handleGenerate()
  }

  // Se tem preview, mostra confirmação
  if (preview) {
    return (
      <div className="h-full flex flex-col gap-2 overflow-y-auto">
        <div className="text-xs font-medium text-purple-300 flex items-center gap-1">
          <span>🎲</span> Resultado Nimb
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {preview.map((card) => {
            const info = CARD_TYPE_INFO[card.type]
            return (
              <div key={card.id} className="bg-bg border border-purple-500/30 rounded-md p-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span>{info.icon}</span>
                  <span className="font-medium text-xs text-fg">{card.name}</span>
                  <span className="text-[10px] text-muted ml-auto">{info.labelPt}</span>
                </div>
                <p className="text-[10px] text-muted leading-relaxed">{card.description}</p>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleConfirm}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium
              bg-green-600/20 border border-green-500/50 text-green-300
              hover:bg-green-600/30 transition-colors"
          >
            Adicionar à aventura
          </button>
          <button
            onClick={handleReroll}
            className="px-3 py-1.5 rounded-md text-xs font-medium
              bg-purple-600/20 border border-purple-500/50 text-purple-300
              hover:bg-purple-600/30 transition-colors"
          >
            🎲 Re-rolar
          </button>
          <button
            onClick={() => setPreview(null)}
            className="px-3 py-1.5 rounded-md text-xs text-muted hover:text-fg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 overflow-y-auto h-full">
      {/* Seletor de tipos */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
            Tipos de carta
          </span>
          <div className="flex gap-2">
            <button onClick={() => setSelectedTypes(new Set(ALL_TYPES))} className="text-[10px] text-accent hover:text-accent/80">Todos</button>
            <button onClick={() => setSelectedTypes(new Set())} className="text-[10px] text-muted hover:text-fg">Nenhum</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {ALL_TYPES.map(type => {
            const info = CARD_TYPE_INFO[type]
            const isSelected = selectedTypes.has(type)
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors
                  ${isSelected
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-bg border border-stroke text-muted hover:border-accent/30'
                  }
                `}
              >
                <span>{info.icon}</span>
                <span>{info.labelPt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tier de ameaça */}
      {selectedTypes.has('threat') && (
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
            Nível de ameaça
          </span>
          <div className="grid grid-cols-2 gap-1">
            {THREAT_TIERS.map((tier, i) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(i + 1)}
                className={`
                  px-2 py-1 rounded text-[10px] font-medium transition-colors
                  ${selectedTier === i + 1
                    ? 'bg-red-600/20 border border-red-500/50 text-red-300'
                    : 'bg-bg border border-stroke text-muted hover:border-red-500/30'
                  }
                `}
              >
                <div>{tier.label}</div>
                <div className="opacity-60">{tier.ndRange}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botão gerar */}
      <button
        onClick={handleGenerate}
        disabled={selectedTypes.size === 0}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium
          bg-purple-600/20 border border-purple-500/50 text-purple-300
          hover:bg-purple-600/30 hover:border-purple-400
          disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span>🎲</span>
        <span>Gerar ({selectedTypes.size} tipo{selectedTypes.size !== 1 ? 's' : ''})</span>
      </button>
    </div>
  )
}
