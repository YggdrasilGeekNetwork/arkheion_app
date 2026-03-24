import { useState } from 'react'
import { useWizard } from '~/contexts/WizardContext'
import type { OriginItem } from '~/types/wizard'

// ── Static armor/shield options ───────────────────────────────────────────────

const LIGHT_ARMOR_OPTIONS = [
  { id: 'armadura_de_couro',  name: 'Armadura de Couro' },
  { id: 'couro_batido',       name: 'Couro Batido' },
  { id: 'gibao_de_peles',     name: 'Gibão de Peles' },
]
const HEAVY_ARMOR_OPTION = { id: 'brunea', name: 'Brunea' }
const SHIELD_OPTION       = { id: 'escudo_leve', name: 'Escudo Leve' }

const FIXED_ITEMS = ['Mochila', 'Saco de Dormir', 'Traje de Viajante']

// ── Weapon row ────────────────────────────────────────────────────────────────

type Weapon = { id: string; name: string; damage?: string; damageType?: string; critical?: string; range?: string }

// Normalizes critical field to "margin/×multiplier" format.
// Raw values: "18", "19", "19/x3", "x2", "x3", "x4"
function formatCritical(raw: string | undefined): string {
  if (!raw) return '20/×2'
  if (/^\d+\/x\d+$/.test(raw)) {
    // e.g. "19/x3" → "19/×3"
    const [margin, mult] = raw.split('/')
    return `${margin}/×${mult.slice(1)}`
  }
  if (/^\d+$/.test(raw)) {
    // margin only, e.g. "19" → "19/×2"
    return `${raw}/×2`
  }
  if (/^x\d+$/.test(raw)) {
    // multiplier only, e.g. "x3" → "20/×3"
    return `20/×${raw.slice(1)}`
  }
  return raw
}

function WeaponRow({ weapon, selected, onSelect }: { weapon: Weapon; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-2 py-1.5 rounded-lg border transition-all ${
        selected ? 'border-accent bg-accent/10' : 'border-stroke bg-card hover:border-accent/50'
      }`}
    >
      <div className="flex items-start gap-1.5">
        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 ${selected ? 'border-accent bg-accent' : 'border-muted'}`} />
        <div className="min-w-0 flex items-center justify-between gap-1 w-full">
          <span className="text-xs font-medium leading-tight truncate">{weapon.name}</span>
          <div className="flex items-center gap-x-1.5 text-[10px] text-muted flex-shrink-0">
            {weapon.damage && <span>{weapon.damage}</span>}
            {weapon.damageType && <span className="text-accent/70">{weapon.damageType}</span>}
            <span>{formatCritical(weapon.critical)}</span>
            {weapon.range && weapon.range !== 'corpo a corpo' && <span className="italic">{weapon.range}</span>}
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Armor row ─────────────────────────────────────────────────────────────────

function ArmorRow({ armor, selected, onSelect }: { armor: { id: string; name: string }; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
        selected ? 'border-accent bg-accent/10' : 'border-stroke bg-card hover:border-accent/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${selected ? 'border-accent bg-accent' : 'border-muted'}`} />
        <span className="text-sm font-medium">{armor.name}</span>
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

// Returns the weapon list matching a weapon-choice option text
function weaponListForOption(optionText: string, martial: Weapon[], exotic: Weapon[]): { list: Weapon[]; label: string } | null {
  const t = optionText.toLowerCase()
  if (t.includes('marcial')) return { list: martial, label: 'Armas Marciais' }
  if (t.includes('exótica') || t.includes('exotica')) return { list: exotic, label: 'Armas Exóticas' }
  return null
}

export default function EquipmentStep() {
  const { state, dispatch, loaderData } = useWizard()
  const { classes: selectedClasses, startingEquipment, currencies, origin, originItemChoices, originItemWeaponChoices } = state.data

  const simpleWeapons: Weapon[] = loaderData?.simpleWeapons || []
  const martialWeapons: Weapon[] = loaderData?.martialWeapons || []
  const exoticWeapons: Weapon[] = loaderData?.exoticWeapons || []

  // Origin items
  const originData = origin ? loaderData?.origins?.find(o => o.id === origin.id) : null
  const originItems: OriginItem[] = originData?.items ?? []

  const setItemChoice = (itemIndex: number, optionText: string) => {
    // Clear weapon sub-choice when the category option changes
    const newWeaponChoices = { ...(originItemWeaponChoices ?? {}) }
    delete newWeaponChoices[itemIndex]
    dispatch({ type: 'SET_ORIGIN_ITEM_WEAPON_CHOICES', payload: newWeaponChoices })
    dispatch({
      type: 'SET_ORIGIN_ITEM_CHOICES',
      payload: { ...originItemChoices, [itemIndex]: optionText },
    })
  }

  const setItemWeaponChoice = (itemIndex: number, weapon: Weapon) => {
    dispatch({
      type: 'SET_ORIGIN_ITEM_WEAPON_CHOICES',
      payload: { ...(originItemWeaponChoices ?? {}), [itemIndex]: { id: weapon.id, name: weapon.name } },
    })
  }

  // Compute proficiencies from selected classes
  const classData = loaderData?.classes || []
  const selectedClassData = selectedClasses.map(c => classData.find(cd => cd.id === c.id)).filter(Boolean)
  const hasMartialProf = selectedClassData.some(c => c?.proficiencies?.weapons?.includes('marciais'))
  const hasHeavyArmorProf = selectedClassData.some(c => c?.proficiencies?.armors?.includes('pesadas'))
  const hasShieldProf = selectedClassData.some(c => c?.proficiencies?.shields === true)
  const isArcanist = selectedClasses.some(c => c.id === 'arcanista')

  // Armor options based on proficiencies
  const armorOptions = isArcanist ? [] : [
    ...LIGHT_ARMOR_OPTIONS,
    ...(hasHeavyArmorProf ? [HEAVY_ARMOR_OPTION] : []),
  ]

  // Current selections
  const selectedSimpleId = startingEquipment.weapons.find(w =>
    simpleWeapons.some(sw => sw.id === w.id)
  )?.id ?? null
  const selectedMartialId = startingEquipment.weapons.find(w =>
    martialWeapons.some(mw => mw.id === w.id)
  )?.id ?? null
  const selectedArmorId = startingEquipment.armor.find(a =>
    a.id !== SHIELD_OPTION.id
  )?.id ?? null
  const hasShield = startingEquipment.armor.some(a => a.id === SHIELD_OPTION.id)

  // Helpers to update equipment
  const updateWeapons = (simpleId: string | null, martialId: string | null) => {
    const weapons = []
    if (simpleId) {
      const w = simpleWeapons.find(w => w.id === simpleId)
      if (w) weapons.push({ id: w.id, name: w.name })
    }
    if (martialId) {
      const w = martialWeapons.find(w => w.id === martialId)
      if (w) weapons.push({ id: w.id, name: w.name })
    }
    dispatch({ type: 'SET_STARTING_EQUIPMENT', payload: { ...startingEquipment, weapons } })
  }

  const updateArmor = (armorId: string | null, shield: boolean) => {
    const armor = []
    if (armorId) {
      const a = [...LIGHT_ARMOR_OPTIONS, HEAVY_ARMOR_OPTION].find(a => a.id === armorId)
      if (a) armor.push({ id: a.id, name: a.name })
    }
    if (shield) armor.push({ id: SHIELD_OPTION.id, name: SHIELD_OPTION.name })
    dispatch({ type: 'SET_STARTING_EQUIPMENT', payload: { ...startingEquipment, armor } })
  }

  // Gold roller
  const [goldRolled, setGoldRolled] = useState(false)
  const rollGold = () => {
    const roll = [1,2,3,4].reduce((sum) => sum + Math.floor(Math.random() * 6) + 1, 0)
    dispatch({ type: 'SET_CURRENCIES', payload: { ...currencies, to: roll } })
    setGoldRolled(true)
  }

  // Completeness
  const simpleChosen = selectedSimpleId !== null
  const martialChosen = !hasMartialProf || selectedMartialId !== null
  const armorChosen = isArcanist || selectedArmorId !== null
  const goldSet = currencies.to > 0 || currencies.tp > 0 || currencies.tc > 0
  const isComplete = simpleChosen && martialChosen && armorChosen && goldSet

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Equipamento Inicial</h2>
        <p className="text-sm text-muted">
          Todo personagem começa com os itens abaixo. Faça suas escolhas de arma, armadura e role seu ouro inicial.
        </p>
      </div>

      {/* Fixed items */}
      <div className="bg-card-muted border border-stroke rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">Itens Fixos</h3>
        <div className="flex flex-wrap gap-1.5">
          {FIXED_ITEMS.map(item => (
            <span key={item} className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-1 rounded">
              {item}
            </span>
          ))}
        </div>

        {/* Origin items */}
        {originItems.length > 0 && (
          <div className="mt-3">
            <h3 className="text-sm font-semibold mb-2">
              Itens da Origem
              {origin && <span className="text-xs font-normal text-muted ml-1">({origin.name})</span>}
            </h3>
            <div className="space-y-1.5">
              {originItems.map((item, i) => {
                if (item.type === 'fixed') {
                  return (
                    <span key={i} className="inline-block text-xs bg-card border border-stroke text-muted px-2 py-1 rounded mr-1.5">
                      {item.quantity && item.quantity > 1 ? `${item.text} ×${item.quantity}` : item.text}
                    </span>
                  )
                }
                // choice item
                const selected = originItemChoices?.[i]
                return (
                  <div key={i} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted font-medium">{item.text}:</span>
                    {item.options.map(opt => (
                      <button
                        key={opt.text}
                        type="button"
                        onClick={() => setItemChoice(i, opt.text)}
                        className={`text-xs px-2 py-1 rounded border transition-all ${
                          selected === opt.text
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-stroke bg-card text-muted hover:border-accent/50'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Origin weapon sub-choices (e.g. Gladiador) — rendered at top level */}
      {originItems.map((item, i) => {
        if (item.type !== 'choice') return null
        const selected = originItemChoices?.[i]
        if (!selected) return null
        const weaponList = weaponListForOption(selected, martialWeapons, exoticWeapons)
        if (!weaponList) return null
        const selectedWeapon = originItemWeaponChoices?.[i] ?? null
        return (
          <div key={`origin-weapon-${i}`}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold">{weaponList.label}</h3>
              <span className="text-xs text-muted bg-card border border-stroke px-1.5 py-0.5 rounded">origem: {origin?.name}</span>
              {selectedWeapon
                ? <span className="text-xs text-accent">✓ escolhida</span>
                : <span className="text-xs text-yellow-500">pendente</span>}
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto pr-1">
              {weaponList.list.map(w => (
                <WeaponRow
                  key={w.id}
                  weapon={w}
                  selected={selectedWeapon?.id === w.id}
                  onSelect={() => setItemWeaponChoice(i, w)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Simple weapon */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold">Arma Simples</h3>
          {simpleChosen
            ? <span className="text-xs text-accent">✓ escolhida</span>
            : <span className="text-xs text-yellow-500">pendente</span>}
        </div>
        <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto pr-1">
          {simpleWeapons.map(w => (
            <WeaponRow
              key={w.id}
              weapon={w}
              selected={selectedSimpleId === w.id}
              onSelect={() => updateWeapons(w.id, selectedMartialId)}
            />
          ))}
        </div>
      </div>

      {/* Martial weapon (only if proficient) */}
      {hasMartialProf && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold">Arma Marcial</h3>
            <span className="text-xs text-muted bg-card border border-stroke px-1.5 py-0.5 rounded">proficiência marcial</span>
            {martialChosen
              ? <span className="text-xs text-accent">✓ escolhida</span>
              : <span className="text-xs text-yellow-500">pendente</span>}
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto pr-1">
            {martialWeapons.map(w => (
              <WeaponRow
                key={w.id}
                weapon={w}
                selected={selectedMartialId === w.id}
                onSelect={() => updateWeapons(selectedSimpleId, w.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Armor */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold">Armadura</h3>
          {isArcanist
            ? <span className="text-xs text-muted bg-card border border-stroke px-1.5 py-0.5 rounded">arcanistas não usam armadura</span>
            : armorChosen
              ? <span className="text-xs text-accent">✓ escolhida</span>
              : <span className="text-xs text-yellow-500">pendente</span>}
        </div>

        {isArcanist ? (
          <p className="text-sm text-muted italic">Arcanistas começam sem armadura.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1">
              {armorOptions.map(a => (
                <ArmorRow
                  key={a.id}
                  armor={a}
                  selected={selectedArmorId === a.id}
                  onSelect={() => updateArmor(a.id, hasShieldProf && hasShield)}
                />
              ))}
            </div>

            {/* Shield (if proficient — auto-included, toggle allowed) */}
            {hasShieldProf && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => updateArmor(selectedArmorId, !hasShield)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                    hasShield ? 'border-accent bg-accent/10' : 'border-stroke bg-card hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${hasShield ? 'border-accent bg-accent' : 'border-muted'}`}>
                      {hasShield && <svg className="w-2 h-2 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-sm font-medium">{SHIELD_OPTION.name}</span>
                    <span className="text-xs text-muted bg-card border border-stroke px-1.5 py-0.5 rounded">proficiência com escudos</span>
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Starting gold */}
      <div className="bg-card-muted border border-stroke rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Ouro Inicial (4d6 T$)</h3>
          {goldSet
            ? <span className="text-xs text-accent">✓ definido</span>
            : <span className="text-xs text-yellow-500">pendente</span>}
        </div>
        <p className="text-xs text-muted">Role 4d6 para determinar seu ouro inicial, ou insira manualmente.</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={rollGold}
            className="px-4 py-2 text-sm rounded-lg bg-accent text-card font-medium hover:bg-accent/90 transition-colors"
          >
            {goldRolled ? 'Rolar novamente' : 'Rolar 4d6'}
          </button>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-sm text-muted whitespace-nowrap">TO:</label>
            <input
              type="number"
              value={currencies.to}
              onChange={e => dispatch({ type: 'SET_CURRENCIES', payload: { ...currencies, to: Math.max(0, parseInt(e.target.value) || 0) } })}
              min={0}
              className="w-full px-3 py-1.5 bg-card border border-stroke rounded focus:border-accent focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {isComplete && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-1 text-sm">
          <h3 className="font-semibold mb-2">Resumo do Equipamento</h3>
          {FIXED_ITEMS.map(i => <div key={i} className="text-muted">• {i}</div>)}
          {originItems.map((item, i) => {
            if (item.type === 'fixed') {
              return <div key={i} className="text-muted">• {item.quantity && item.quantity > 1 ? `${item.text} ×${item.quantity}` : item.text}</div>
            }
            const categoryChoice = originItemChoices?.[i]
            const weaponChoice = originItemWeaponChoices?.[i]
            const weaponList = categoryChoice ? weaponListForOption(categoryChoice, martialWeapons, exoticWeapons) : null
            const display = weaponList
              ? (weaponChoice ? weaponChoice.name : `${item.text} (arma pendente)`)
              : (categoryChoice ?? `${item.text} (pendente)`)
            return <div key={i} className="text-muted">• {display}</div>
          })}
          {startingEquipment.weapons.map(w => <div key={w.id} className="text-muted">• {w.name}</div>)}
          {startingEquipment.armor.map(a => <div key={a.id} className="text-muted">• {a.name}</div>)}
          <div className="text-muted">• {currencies.to} TO</div>
        </div>
      )}
    </div>
  )
}
