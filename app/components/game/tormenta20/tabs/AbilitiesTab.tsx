import { useState, useMemo } from 'react'
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

// Spell sorting options
type SpellSortOption = 'name' | 'circle' | 'school' | 'type' | 'execution'
const SPELL_SORT_OPTIONS: { value: SpellSortOption; label: string }[] = [
  { value: 'name', label: 'Nome' },
  { value: 'circle', label: 'Círculo' },
  { value: 'school', label: 'Escola' },
  { value: 'type', label: 'Tipo' },
  { value: 'execution', label: 'Execução' },
]

// Spell filter types
type SpellFilters = {
  circle: number | null
  school: string | null
  type: 'arcana' | 'divina' | null
  favorites: boolean
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
  onToggleFavoriteAbility?: (abilityId: string) => void
  onToggleFavoriteSpell?: (spellId: string) => void
  onManaChange?: (delta: number) => void
  onHealthChange?: (delta: number) => void
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

function AbilityCard({
  ability,
  onUse,
  onToggleFavorite,
  showFavorite = false,
}: {
  ability: Ability
  onUse?: (ability: Ability) => void
  onToggleFavorite?: () => void
  showFavorite?: boolean
}) {
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
          {showFavorite && onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`text-[10px] px-1.5 py-1 rounded transition-colors ${
                ability.isFavorite
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-card text-muted hover:text-yellow-400'
              }`}
              title={ability.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {ability.isFavorite ? '★' : '☆'}
            </button>
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

function SpellCard({
  spell,
  onCast,
  onToggleFavorite,
  showFavorite = false,
}: {
  spell: Spell
  onCast: (spell: Spell) => void
  onToggleFavorite?: () => void
  showFavorite?: boolean
}) {
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
        <div className="flex items-center gap-1.5">
          {showFavorite && onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`text-[10px] px-1.5 py-1 rounded transition-colors ${
                spell.isFavorite
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-card text-muted hover:text-yellow-400'
              }`}
              title={spell.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {spell.isFavorite ? '★' : '☆'}
            </button>
          )}
          <button
            onClick={() => onCast(spell)}
            className="text-[10px] px-2 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors font-semibold"
          >
            Lançar
          </button>
        </div>
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
  onManaChange,
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
  onManaChange?: (delta: number) => void
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
    // Deduct PM
    if (onManaChange) {
      onManaChange(-totalPmCost)
    }

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

    // TODO: Roll damage if autoRollDamage and hasDamageRoll
    console.log('Casting spell:', spell.name, 'with enhancements:', selectedEnhancements, 'PM cost:', totalPmCost)
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

export default function AbilitiesTab({
  character,
  onAddActiveEffect,
  onToggleFavoriteAbility,
  onToggleFavoriteSpell,
  onManaChange,
  onHealthChange,
}: AbilitiesTabProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    active: true,
    passive: true,
    spells: true,
  })
  const [castingSpell, setCastingSpell] = useState<Spell | null>(null)
  const [usingAbility, setUsingAbility] = useState<Ability | null>(null)

  // Spell sorting and filtering state
  const [spellSort, setSpellSort] = useState<SpellSortOption>('circle')
  const [spellFilters, setSpellFilters] = useState<SpellFilters>({
    circle: null,
    school: null,
    type: null,
    favorites: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const activeAbilities = character.abilities?.filter(a => a.type === 'active') || []
  const passiveAbilities = character.abilities?.filter(a => a.type === 'passive') || []
  const allSpells = character.spells || []

  // Get unique values for filter dropdowns
  const availableCircles = useMemo(() => {
    const circles = [...new Set(allSpells.map(s => s.circle))].sort((a, b) => a - b)
    return circles
  }, [allSpells])

  const availableSchools = useMemo(() => {
    const schools = [...new Set(allSpells.map(s => s.school))]
    return schools.sort()
  }, [allSpells])

  // Filter and sort spells
  const filteredAndSortedSpells = useMemo(() => {
    let result = [...allSpells]

    // Apply filters
    if (spellFilters.circle !== null) {
      result = result.filter(s => s.circle === spellFilters.circle)
    }
    if (spellFilters.school !== null) {
      result = result.filter(s => s.school === spellFilters.school)
    }
    if (spellFilters.type !== null) {
      result = result.filter(s => s.type === spellFilters.type)
    }
    if (spellFilters.favorites) {
      result = result.filter(s => s.isFavorite)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (spellSort) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'circle':
          return a.circle - b.circle || a.name.localeCompare(b.name)
        case 'school':
          return a.school.localeCompare(b.school) || a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
        case 'execution':
          return a.execution.localeCompare(b.execution) || a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return result
  }, [allSpells, spellFilters, spellSort])

  const hasActiveFilters = spellFilters.circle !== null || spellFilters.school !== null || spellFilters.type !== null || spellFilters.favorites

  const clearFilters = () => {
    setSpellFilters({ circle: null, school: null, type: null, favorites: false })
  }

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
            <AbilityCard
              key={ability.id}
              ability={ability}
              onUse={setUsingAbility}
              onToggleFavorite={onToggleFavoriteAbility ? () => onToggleFavoriteAbility(ability.id) : undefined}
              showFavorite={!!onToggleFavoriteAbility}
            />
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

      {allSpells.length > 0 && (
        <div className="bg-card border border-stroke rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('spells')}
            className="w-full flex items-center justify-between p-3 hover:bg-card-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Magias</span>
              <span className="text-xs bg-card-muted px-2 py-0.5 rounded">
                {filteredAndSortedSpells.length}
                {hasActiveFilters && ` / ${allSpells.length}`}
              </span>
            </div>
            <div className={`transition-transform ${openSections.spells ? 'rotate-180' : ''}`}>▼</div>
          </button>

          {openSections.spells && (
            <div className="p-3 space-y-3">
              {/* Filters and Sort */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-stroke">
                {/* Sort dropdown */}
                <select
                  value={spellSort}
                  onChange={(e) => setSpellSort(e.target.value as SpellSortOption)}
                  className="text-xs px-2 py-1 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
                >
                  {SPELL_SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      Ordenar: {opt.label}
                    </option>
                  ))}
                </select>

                {/* Circle filter */}
                <div className="flex items-center gap-0.5">
                  <select
                    value={spellFilters.circle ?? ''}
                    onChange={(e) => setSpellFilters(prev => ({
                      ...prev,
                      circle: e.target.value ? Number(e.target.value) : null
                    }))}
                    className={`text-xs px-2 py-1 bg-card-muted border rounded focus:outline-none focus:border-accent ${
                      spellFilters.circle !== null ? 'border-accent' : 'border-stroke'
                    }`}
                  >
                    <option value="">Todos círculos</option>
                    {availableCircles.map(c => (
                      <option key={c} value={c}>{c}º círculo</option>
                    ))}
                  </select>
                  {spellFilters.circle !== null && (
                    <button
                      onClick={() => setSpellFilters(prev => ({ ...prev, circle: null }))}
                      className="text-xs px-1 py-1 text-muted hover:text-red-400 transition-colors"
                      title="Limpar filtro"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* School filter */}
                <div className="flex items-center gap-0.5">
                  <select
                    value={spellFilters.school ?? ''}
                    onChange={(e) => setSpellFilters(prev => ({
                      ...prev,
                      school: e.target.value || null
                    }))}
                    className={`text-xs px-2 py-1 bg-card-muted border rounded focus:outline-none focus:border-accent ${
                      spellFilters.school !== null ? 'border-accent' : 'border-stroke'
                    }`}
                  >
                    <option value="">Todas escolas</option>
                    {availableSchools.map(s => (
                      <option key={s} value={s}>{SCHOOL_LABELS[s] || s}</option>
                    ))}
                  </select>
                  {spellFilters.school !== null && (
                    <button
                      onClick={() => setSpellFilters(prev => ({ ...prev, school: null }))}
                      className="text-xs px-1 py-1 text-muted hover:text-red-400 transition-colors"
                      title="Limpar filtro"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Type filter */}
                <div className="flex items-center gap-0.5">
                  <select
                    value={spellFilters.type ?? ''}
                    onChange={(e) => setSpellFilters(prev => ({
                      ...prev,
                      type: (e.target.value as 'arcana' | 'divina') || null
                    }))}
                    className={`text-xs px-2 py-1 bg-card-muted border rounded focus:outline-none focus:border-accent ${
                      spellFilters.type !== null ? 'border-accent' : 'border-stroke'
                    }`}
                  >
                    <option value="">Todos tipos</option>
                    <option value="arcana">Arcana</option>
                    <option value="divina">Divina</option>
                  </select>
                  {spellFilters.type !== null && (
                    <button
                      onClick={() => setSpellFilters(prev => ({ ...prev, type: null }))}
                      className="text-xs px-1 py-1 text-muted hover:text-red-400 transition-colors"
                      title="Limpar filtro"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Favorites filter */}
                <button
                  onClick={() => setSpellFilters(prev => ({ ...prev, favorites: !prev.favorites }))}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    spellFilters.favorites
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                      : 'bg-card-muted border-stroke text-muted hover:border-yellow-500'
                  }`}
                >
                  ★ Favoritos
                </button>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/50 hover:bg-red-500/30 transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Spell list */}
              <div className="space-y-2">
                {filteredAndSortedSpells.length > 0 ? (
                  filteredAndSortedSpells.map(spell => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      onCast={setCastingSpell}
                      onToggleFavorite={onToggleFavoriteSpell ? () => onToggleFavoriteSpell(spell.id) : undefined}
                      showFavorite={!!onToggleFavoriteSpell}
                    />
                  ))
                ) : (
                  <div className="text-xs text-muted text-center py-4">
                    Nenhuma magia encontrada com os filtros selecionados.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spell Casting Modal */}
      <SpellCastModal
        spell={castingSpell}
        isOpen={castingSpell !== null}
        onClose={() => setCastingSpell(null)}
        character={character}
        onAddActiveEffect={onAddActiveEffect}
        onManaChange={onManaChange}
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
                  // Deduct PM
                  if (usingAbility.cost?.pm && onManaChange) {
                    onManaChange(-usingAbility.cost.pm)
                  }
                  // Deduct PV
                  if (usingAbility.cost?.pv && onHealthChange) {
                    onHealthChange(-usingAbility.cost.pv)
                  }

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

                  // TODO: Track uses per day
                  console.log('Using ability:', usingAbility.name, 'PM:', usingAbility.cost?.pm, 'PV:', usingAbility.cost?.pv)
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
