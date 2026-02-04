import { useState } from 'react'
import type { Character, Ability, Spell, SpellEnhancement } from '~/types/character'
import Modal from '~/components/ui/Modal'

const ACTION_TYPE_LABELS: Record<string, string> = {
  standard: 'Padrão',
  movement: 'Movimento',
  free: 'Livre',
  full: 'Completa',
  reaction: 'Reação',
  padrão: 'Padrão',
  movimento: 'Movimento',
  livre: 'Livre',
  completa: 'Completa',
  reação: 'Reação',
}

const SCHOOL_LABELS: Record<string, string> = {
  abjur: 'Abjuração',
  adiv: 'Adivinhação',
  conv: 'Convocação',
  encan: 'Encantamento',
  evoc: 'Evocação',
  ilusão: 'Ilusão',
  necro: 'Necromancia',
  trans: 'Transmutação',
}

type AbilitiesTabProps = {
  character: Character
  onAddActiveEffect?: (effect: {
    name: string
    description: string
    source: string
    type: 'active' | 'consumable'
    duration?: string
    consumeOnAttack?: boolean
  }) => void
}

function Collapsible({ title, count, isOpen, onToggle, children }: {
  title: string
  count: number
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-card border border-stroke rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-card-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs bg-card-muted px-2 py-0.5 rounded">{count}</span>
        </div>
        <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</div>
      </button>
      {isOpen && <div className="p-3 space-y-2">{children}</div>}
    </div>
  )
}

function AbilityCard({ ability, onUse }: { ability: Ability; onUse?: (ability: Ability) => void }) {
  const isActive = ability.type === 'active'

  return (
    <div className="text-xs p-2.5 bg-card-muted rounded">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">{ability.name}</span>
        <div className="flex items-center gap-1.5">
          {ability.actionType && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
              {ACTION_TYPE_LABELS[ability.actionType]}
            </span>
          )}
          {ability.cost?.pm && (
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
              {ability.cost.pm} PM
            </span>
          )}
          {isActive && onUse && (
            <button
              onClick={() => onUse(ability)}
              className="text-[10px] px-2 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors font-semibold"
            >
              Usar
            </button>
          )}
        </div>
      </div>
      <div className="text-muted">{ability.description}</div>
      <div className="flex items-center gap-2 mt-1">
        {ability.source && (
          <span className="text-[10px] text-muted">Origem: {ability.source}</span>
        )}
        {ability.usesPerDay !== undefined && (
          <span className="text-[10px] text-muted">• {ability.usesPerDay}x/dia</span>
        )}
      </div>
    </div>
  )
}

function SpellCard({ spell, onCast }: { spell: Spell; onCast: (spell: Spell) => void }) {
  const basePmCost = spell.circle * 2 - 1 // 1º círculo = 1 PM, 2º = 3 PM, etc.

  return (
    <div className="text-xs p-2.5 bg-card-muted rounded">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{spell.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
            {spell.circle}º círculo
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-card rounded capitalize">
            {spell.type}
          </span>
        </div>
        <button
          onClick={() => onCast(spell)}
          className="text-[10px] px-2 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors font-semibold"
        >
          Lançar
        </button>
      </div>
      <div className="text-muted mb-1.5">{spell.description}</div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted">
        <span>{SCHOOL_LABELS[spell.school] || spell.school}</span>
        <span>Execução: {spell.execution}</span>
        <span>Alcance: {spell.range}</span>
        <span>Duração: {spell.duration}</span>
        <span className="text-purple-400">{basePmCost} PM</span>
        {spell.resistance && <span>Resistência: {spell.resistance}</span>}
      </div>
    </div>
  )
}

function SpellCastModal({
  spell,
  isOpen,
  onClose,
  character,
  onAddActiveEffect,
}: {
  spell: Spell | null
  isOpen: boolean
  onClose: () => void
  character: Character
  onAddActiveEffect?: (effect: {
    name: string
    description: string
    source: string
    type: 'active' | 'consumable'
    duration?: string
    consumeOnAttack?: boolean
  }) => void
}) {
  const [selectedEnhancements, setSelectedEnhancements] = useState<number[]>([])
  const [autoRollDamage, setAutoRollDamage] = useState(true)

  if (!spell) return null

  const basePmCost = spell.circle * 2 - 1
  const enhancementCost = selectedEnhancements.reduce((sum, idx) => {
    return sum + (spell.enhancements?.[idx]?.cost || 0)
  }, 0)
  const totalPmCost = basePmCost + enhancementCost

  const canAfford = character.mana >= totalPmCost
  const hasDamageRoll = spell.description.match(/\d+d\d+/)

  const toggleEnhancement = (index: number) => {
    setSelectedEnhancements(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handleCast = () => {
    // Add active effect if callback is provided and spell has duration
    if (onAddActiveEffect && spell.duration && spell.duration !== 'instantânea') {
      onAddActiveEffect({
        name: spell.name,
        description: spell.description,
        source: `Magia (${spell.circle}º círculo)`,
        type: 'active',
        duration: spell.duration,
      })
    }
    // TODO: Implement actual casting logic
    // - Deduct PM
    // - Roll damage if autoRollDamage and hasDamageRoll
    console.log('Casting spell:', spell.name, 'with enhancements:', selectedEnhancements)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={spell.name}>
      <div className="space-y-4">
        {/* Spell Info */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
            {spell.circle}º círculo
          </span>
          <span className="px-2 py-1 bg-card-muted rounded capitalize">
            {spell.type}
          </span>
          <span className="px-2 py-1 bg-card-muted rounded">
            {SCHOOL_LABELS[spell.school] || spell.school}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted">{spell.description}</p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-card-muted rounded">
            <span className="text-muted">Execução:</span>
            <span className="ml-1 font-semibold">{spell.execution}</span>
          </div>
          <div className="p-2 bg-card-muted rounded">
            <span className="text-muted">Alcance:</span>
            <span className="ml-1 font-semibold">{spell.range}</span>
          </div>
          <div className="p-2 bg-card-muted rounded">
            <span className="text-muted">Duração:</span>
            <span className="ml-1 font-semibold">{spell.duration}</span>
          </div>
          {spell.target && (
            <div className="p-2 bg-card-muted rounded">
              <span className="text-muted">Alvo:</span>
              <span className="ml-1 font-semibold">{spell.target.type}</span>
            </div>
          )}
          {spell.resistance && (
            <div className="p-2 bg-card-muted rounded col-span-2">
              <span className="text-muted">Resistência:</span>
              <span className="ml-1 font-semibold">{spell.resistance}</span>
            </div>
          )}
        </div>

        {/* Enhancements */}
        {spell.enhancements && spell.enhancements.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">Aprimoramentos</div>
            <div className="space-y-2">
              {spell.enhancements.map((enh, idx) => {
                const isSelected = selectedEnhancements.includes(idx)
                const canAffordEnhancement = character.mana >= totalPmCost + (isSelected ? 0 : enh.cost)

                return (
                  <button
                    key={idx}
                    onClick={() => canAffordEnhancement && toggleEnhancement(idx)}
                    disabled={!canAffordEnhancement && !isSelected}
                    className={`w-full text-left p-2 rounded border transition-colors ${
                      isSelected
                        ? 'bg-accent/20 border-accent'
                        : canAffordEnhancement
                          ? 'bg-card-muted border-stroke hover:border-accent'
                          : 'bg-card-muted border-stroke opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-1.5 py-0.5 rounded ${
                        enh.type === 'muda' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        +{enh.cost} PM • {enh.type === 'muda' ? 'Muda' : 'Aumenta'}
                      </span>
                      {isSelected && <span className="text-accent">✓</span>}
                    </div>
                    <p className="text-xs text-muted mt-1">{enh.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Auto-roll damage */}
        {hasDamageRoll && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoRollDamage}
              onChange={(e) => setAutoRollDamage(e.target.checked)}
              className="w-4 h-4 rounded border-stroke bg-card-muted accent-accent"
            />
            <span>Rolar dados automaticamente</span>
          </label>
        )}

        {/* Cost & Cast */}
        <div className="flex items-center justify-between pt-2 border-t border-stroke">
          <div className="text-sm">
            <span className="text-muted">Custo total:</span>
            <span className={`ml-2 font-bold ${canAfford ? 'text-purple-400' : 'text-red-400'}`}>
              {totalPmCost} PM
            </span>
            <span className="text-muted ml-1">/ {character.mana} disponível</span>
          </div>
          <button
            onClick={handleCast}
            disabled={!canAfford}
            className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
              canAfford
                ? 'bg-accent text-card hover:bg-accent-hover'
                : 'bg-card-muted text-muted cursor-not-allowed'
            }`}
          >
            Lançar Magia
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function AbilitiesTab({ character, onAddActiveEffect }: AbilitiesTabProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    active: true,
    passive: true,
    spells: true,
  })
  const [castingSpell, setCastingSpell] = useState<Spell | null>(null)
  const [usingAbility, setUsingAbility] = useState<Ability | null>(null)

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const activeAbilities = character.abilities?.filter(a => a.type === 'active') || []
  const passiveAbilities = character.abilities?.filter(a => a.type === 'passive') || []
  const spells = character.spells || []

  return (
    <div className="space-y-3">
      {activeAbilities.length > 0 && (
        <Collapsible
          title="Habilidades Ativas"
          count={activeAbilities.length}
          isOpen={openSections.active}
          onToggle={() => toggleSection('active')}
        >
          {activeAbilities.map(ability => (
            <AbilityCard key={ability.id} ability={ability} onUse={setUsingAbility} />
          ))}
        </Collapsible>
      )}

      {passiveAbilities.length > 0 && (
        <Collapsible
          title="Habilidades Passivas"
          count={passiveAbilities.length}
          isOpen={openSections.passive}
          onToggle={() => toggleSection('passive')}
        >
          {passiveAbilities.map(ability => (
            <AbilityCard key={ability.id} ability={ability} />
          ))}
        </Collapsible>
      )}

      {spells.length > 0 && (
        <Collapsible
          title="Magias"
          count={spells.length}
          isOpen={openSections.spells}
          onToggle={() => toggleSection('spells')}
        >
          {spells.map(spell => (
            <SpellCard
              key={spell.id}
              spell={spell}
              onCast={setCastingSpell}
            />
          ))}
        </Collapsible>
      )}

      {/* Spell Casting Modal */}
      <SpellCastModal
        spell={castingSpell}
        isOpen={castingSpell !== null}
        onClose={() => setCastingSpell(null)}
        character={character}
        onAddActiveEffect={onAddActiveEffect}
      />

      {/* Ability Use Modal */}
      <Modal
        isOpen={usingAbility !== null}
        onClose={() => setUsingAbility(null)}
        title={usingAbility?.name || 'Habilidade'}
      >
        {usingAbility && (
          <div className="space-y-4">
            {/* Ability Info */}
            <div className="flex flex-wrap gap-2 text-xs">
              {usingAbility.actionType && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  {ACTION_TYPE_LABELS[usingAbility.actionType]}
                </span>
              )}
              {usingAbility.cost?.pm && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                  {usingAbility.cost.pm} PM
                </span>
              )}
              {usingAbility.cost?.pv && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                  {usingAbility.cost.pv} PV
                </span>
              )}
              {usingAbility.usesPerDay !== undefined && (
                <span className="px-2 py-1 bg-card-muted rounded">
                  {usingAbility.usesPerDay}x/dia
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted">{usingAbility.description}</p>

            {/* Source */}
            {usingAbility.source && (
              <div className="text-xs text-muted">
                <span className="font-semibold">Origem:</span> {usingAbility.source}
              </div>
            )}

            {/* Cost & Use */}
            <div className="flex items-center justify-between pt-2 border-t border-stroke">
              <div className="text-sm">
                {usingAbility.cost?.pm && (
                  <span className={`font-bold ${character.mana >= usingAbility.cost.pm ? 'text-purple-400' : 'text-red-400'}`}>
                    {usingAbility.cost.pm} PM
                  </span>
                )}
                {usingAbility.cost?.pv && (
                  <span className={`font-bold ml-2 ${character.health >= usingAbility.cost.pv ? 'text-red-400' : 'text-red-600'}`}>
                    {usingAbility.cost.pv} PV
                  </span>
                )}
                {!usingAbility.cost?.pm && !usingAbility.cost?.pv && (
                  <span className="text-muted">Sem custo</span>
                )}
              </div>
              <button
                onClick={() => {
                  // Add active effect if callback is provided
                  if (onAddActiveEffect) {
                    onAddActiveEffect({
                      name: usingAbility.name,
                      description: usingAbility.description,
                      source: usingAbility.source || 'Habilidade',
                      type: 'active',
                      duration: usingAbility.usesPerDay !== undefined ? 'até descansar' : undefined,
                    })
                  }
                  // TODO: Implement actual ability use logic
                  // - Deduct PM/PV
                  // - Track uses per day
                  console.log('Using ability:', usingAbility.name)
                  setUsingAbility(null)
                }}
                disabled={
                  (usingAbility.cost?.pm ? character.mana < usingAbility.cost.pm : false) ||
                  (usingAbility.cost?.pv ? character.health < usingAbility.cost.pv : false)
                }
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                  (!usingAbility.cost?.pm || character.mana >= usingAbility.cost.pm) &&
                  (!usingAbility.cost?.pv || character.health >= usingAbility.cost.pv)
                    ? 'bg-accent text-card hover:bg-accent-hover'
                    : 'bg-card-muted text-muted cursor-not-allowed'
                }`}
              >
                Usar Habilidade
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
