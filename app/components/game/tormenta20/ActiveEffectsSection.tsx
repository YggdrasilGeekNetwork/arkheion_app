import { useState } from 'react'
import Card from '~/components/ui/Card'
import Modal from '~/components/ui/Modal'
import type { Character, ActiveEffect, ItemEffect } from '~/types/character'

function getPassiveEffects(equippedItems: Character['equippedItems']): { effect: ItemEffect; source: string }[] {
  const results: { effect: ItemEffect; source: string }[] = []
  const slots = ['rightHand', 'leftHand', 'quickDraw1', 'quickDraw2', 'slot1', 'slot2', 'slot3', 'slot4'] as const

  slots.forEach((slot) => {
    const item = equippedItems[slot]
    if (!item?.effects) return
    item.effects.forEach((effect) => {
      if (effect.type === 'passive') {
        results.push({ effect, source: item.name })
      }
    })
  })

  return results
}

type ActiveEffectsSectionProps = {
  character: Character
  activeEffects: ActiveEffect[]
  onClearEffect: (effectId: string) => void
  onClearEffectsByDuration: (duration: string) => void
  onClearAllEffects: () => void
}

export default function ActiveEffectsSection({
  character,
  activeEffects,
  onClearEffect,
  onClearEffectsByDuration,
  onClearAllEffects,
}: ActiveEffectsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const passiveEffects = getPassiveEffects(character.equippedItems)
  const hasAnyEffects = passiveEffects.length > 0 || activeEffects.length > 0

  if (!hasAnyEffects) return null

  const durations = [...new Set(activeEffects.map(e => e.duration || 'permanente'))]

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">Efeitos Ativos</h3>
          {activeEffects.length > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs px-2 py-1 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
            >
              Encerrar
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {passiveEffects.map((pe, idx) => (
            <div key={`passive-${idx}`} className="flex items-start gap-2 text-xs p-1.5 bg-card-muted rounded">
              <span className="text-[10px] px-1 py-0.5 bg-accent/20 text-accent rounded flex-shrink-0 whitespace-nowrap">Passivo</span>
              <div className="min-w-0">
                <div className="font-semibold truncate">{pe.effect.name}</div>
                <div className="text-[10px] text-muted">{pe.effect.description} • {pe.source}</div>
              </div>
            </div>
          ))}

          {activeEffects.map((effect) => (
            <div key={effect.id} className="flex items-start gap-2 text-xs p-1.5 bg-card-muted rounded">
              <span className={`text-[10px] px-1 py-0.5 rounded flex-shrink-0 whitespace-nowrap ${
                effect.type === 'consumable' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {effect.type === 'consumable' ? 'Consumível' : 'Ativo'}
              </span>
              <div className="min-w-0">
                <div className="font-semibold truncate">{effect.name}</div>
                <div className="text-[10px] text-muted">
                  {effect.description} • {effect.source} • {effect.duration || 'Permanente'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Encerrar Efeitos">
        <div className="space-y-4">
          <div className="space-y-2">
            {activeEffects.map((effect) => (
              <div key={effect.id} className="flex items-center justify-between p-2 bg-card-muted rounded">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="text-xs font-semibold truncate">{effect.name}</div>
                  <div className="text-[10px] text-muted">{effect.source} • {effect.duration || 'Permanente'}</div>
                </div>
                <button
                  onClick={() => onClearEffect(effect.id)}
                  className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors flex-shrink-0"
                >
                  Encerrar
                </button>
              </div>
            ))}
          </div>

          {durations.length > 0 && (
            <div className="pt-3 border-t border-stroke">
              <div className="text-xs font-semibold text-muted mb-2">Por duração</div>
              <div className="space-y-1.5">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => onClearEffectsByDuration(duration)}
                    className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                  >
                    Encerrar todos: <span className="font-semibold">{duration}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-stroke">
            <button
              onClick={onClearAllEffects}
              className="w-full text-xs p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 transition-colors"
            >
              Encerrar todos os efeitos
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
