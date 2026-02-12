import { useState } from 'react'
import type { NPCVersion, Creature, CreatureAttack, CreatureType, CreatureSize } from '~/types/encounter'
import { CREATURE_TYPES, CREATURE_SIZES } from '~/types/encounter'

type NPCVersionFormProps = {
  isCombatant: boolean
  onAdd: (version: NPCVersion) => void
  onCancel: () => void
}

const EMPTY_ATTACK: CreatureAttack = { name: '', bonus: 0, damage: '', type: '', extra: '' }

export default function NPCVersionForm({ isCombatant, onAdd, onCancel }: NPCVersionFormProps) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')

  // Creature stats
  const [nd, setNd] = useState(1)
  const [creatureType, setCreatureType] = useState<CreatureType>('Humanoide')
  const [size, setSize] = useState<CreatureSize>('Médio')
  const [ca, setCa] = useState(12)
  const [pv, setPv] = useState(10)
  const [deslocamento, setDeslocamento] = useState('9m')
  const [attrs, setAttrs] = useState({ for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 })
  const [resists, setResists] = useState({ fortitude: 0, reflexos: 0, vontade: 0 })
  const [attacks, setAttacks] = useState<CreatureAttack[]>([{ ...EMPTY_ATTACK }])
  const [abilities, setAbilities] = useState('')
  const [senses, setSenses] = useState('')

  function handleSubmit() {
    if (!label.trim()) return

    let creature: Creature | undefined
    if (isCombatant) {
      creature = {
        id: `creature-ver-${Date.now()}`,
        name: label.trim(),
        nd, type: creatureType, size, ca, pv, deslocamento,
        attributes: attrs,
        resistances: resists,
        attacks: attacks.filter(a => a.name.trim()),
        abilities: abilities.split('\n').map(s => s.trim()).filter(Boolean),
        senses: senses || undefined,
        isCustom: true,
      }
    }

    const version: NPCVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      label: label.trim(),
      creature,
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    onAdd(version)
  }

  function updateAttack(index: number, field: keyof CreatureAttack, value: string | number) {
    setAttacks(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  const inputClass = 'w-full bg-surface border border-stroke rounded px-1.5 py-1 text-[10px] text-fg'
  const labelClass = 'text-[10px] text-muted font-medium'

  return (
    <div className="space-y-2 bg-bg border border-accent/30 rounded-md p-2">
      <div className="text-[10px] text-accent font-medium">Nova Versão</div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Nome da Versão *</label>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Forma Forte" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Descrição</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição..." className={inputClass} />
        </div>
      </div>

      {isCombatant && (
        <div className="space-y-2 pt-1 border-t border-stroke/30">
          <div className="grid grid-cols-[80px_80px_1fr] gap-2">
            <div>
              <label className={labelClass}>ND</label>
              <input type="number" value={nd} onChange={e => setNd(parseFloat(e.target.value) || 0)} step="0.5" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CA</label>
              <input type="number" value={ca} onChange={e => setCa(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PV</label>
              <input type="number" value={pv} onChange={e => setPv(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={creatureType} onChange={e => setCreatureType(e.target.value as CreatureType)} className={inputClass}>
                {CREATURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tamanho</label>
              <select value={size} onChange={e => setSize(e.target.value as CreatureSize)} className={inputClass}>
                {CREATURE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Atributos</label>
            <div className="grid grid-cols-6 gap-1 mt-0.5">
              {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(attr => (
                <div key={attr} className="text-center">
                  <div className="text-[8px] text-muted uppercase">{attr}</div>
                  <input
                    type="number" value={attrs[attr]}
                    onChange={e => setAttrs(p => ({ ...p, [attr]: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-surface border border-stroke rounded px-1 py-0.5 text-[10px] text-fg text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Resistências</label>
            <div className="grid grid-cols-3 gap-2 mt-0.5">
              {([
                { key: 'fortitude' as const, label: 'Fort', color: 'text-green-400' },
                { key: 'reflexos' as const, label: 'Refl', color: 'text-blue-400' },
                { key: 'vontade' as const, label: 'Von', color: 'text-purple-400' },
              ]).map(({ key, label: lbl, color }) => (
                <div key={key} className="flex items-center gap-1">
                  <span className={`text-[10px] font-medium ${color}`}>{lbl}</span>
                  <input type="number" value={resists[key]} onChange={e => setResists(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                    className="flex-1 bg-surface border border-stroke rounded px-1 py-0.5 text-[10px] text-fg text-center" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass}>Ataques</label>
              <button onClick={() => setAttacks(p => [...p, { ...EMPTY_ATTACK }])} className="text-[10px] text-accent hover:text-accent/80">+ Ataque</button>
            </div>
            <div className="space-y-1 mt-0.5">
              {attacks.map((atk, i) => (
                <div key={i} className="grid grid-cols-[1fr_50px_70px_auto] gap-1 items-end">
                  <input value={atk.name} onChange={e => updateAttack(i, 'name', e.target.value)} placeholder="Nome" className={inputClass} />
                  <input type="number" value={atk.bonus} onChange={e => updateAttack(i, 'bonus', parseInt(e.target.value) || 0)} className={inputClass} />
                  <input value={atk.damage} onChange={e => updateAttack(i, 'damage', e.target.value)} placeholder="1d8" className={inputClass} />
                  {attacks.length > 1 && (
                    <button onClick={() => setAttacks(p => p.filter((_, j) => j !== i))} className="text-[10px] text-red-400 px-1 py-1">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Habilidades</label>
              <textarea value={abilities} onChange={e => setAbilities(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Sentidos</label>
              <input value={senses} onChange={e => setSenses(e.target.value)} className={inputClass} />
              <label className={`${labelClass} mt-1 block`}>Deslocamento</label>
              <input value={deslocamento} onChange={e => setDeslocamento(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel} className="text-[10px] text-muted hover:text-fg px-2 py-1">Cancelar</button>
        <button
          onClick={handleSubmit}
          disabled={!label.trim()}
          className="px-3 py-1 rounded text-[10px] font-medium bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-40 transition-colors"
        >
          Criar Versão
        </button>
      </div>
    </div>
  )
}
