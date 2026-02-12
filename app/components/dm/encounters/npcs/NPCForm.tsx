import { useState } from 'react'
import type { NPC, NPCAlignment, NPCVersion, Creature, CreatureAttack, CreatureType, CreatureSize } from '~/types/encounter'
import { CREATURE_TYPES, CREATURE_SIZES } from '~/types/encounter'

type NPCFormProps = {
  onAdd: (npc: NPC) => void
}

const EMPTY_ATTACK: CreatureAttack = { name: '', bonus: 0, damage: '', type: '', extra: '' }

export default function NPCForm({ onAdd }: NPCFormProps) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [alignment, setAlignment] = useState<NPCAlignment>('neutral')
  const [isCombatant, setIsCombatant] = useState(false)

  // Creature stats (for combatants)
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
  const [versionLabel, setVersionLabel] = useState('Padrão')

  function handleSubmit() {
    if (!name.trim()) return

    const now = new Date().toISOString()
    const npcId = `npc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const versionId = `ver-${Date.now()}`

    let creature: Creature | undefined
    if (isCombatant) {
      creature = {
        id: `creature-${npcId}`,
        name: name.trim(),
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
      id: versionId,
      label: versionLabel.trim() || 'Padrão',
      creature,
      description: description || undefined,
      createdAt: now,
    }

    const npc: NPC = {
      id: npcId,
      name: name.trim(),
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      alignment,
      isCombatant,
      versions: [version],
      createdAt: now,
      updatedAt: now,
    }

    onAdd(npc)
  }

  function updateAttack(index: number, field: keyof CreatureAttack, value: string | number) {
    setAttacks(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  const inputClass = 'w-full bg-surface border border-stroke rounded px-1.5 py-1 text-[10px] text-fg'
  const labelClass = 'text-[10px] text-muted font-medium'

  return (
    <div className="space-y-3 overflow-y-auto">
      {/* Nome + Título */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Nome *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do NPC" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Título</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="O Rei Bandido" className={inputClass} />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className={labelClass}>Descrição</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          placeholder="Descrição breve do NPC..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Alinhamento + Combatente */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Alinhamento</label>
          <div className="flex gap-1 mt-0.5">
            {([
              { value: 'ally' as const, label: 'Aliado', color: 'green' },
              { value: 'neutral' as const, label: 'Neutro', color: 'gray' },
              { value: 'enemy' as const, label: 'Inimigo', color: 'red' },
            ]).map(opt => (
              <button
                key={opt.value}
                onClick={() => setAlignment(opt.value)}
                className={`flex-1 text-[10px] px-1.5 py-1 rounded border transition-colors ${
                  alignment === opt.value
                    ? `border-${opt.color}-500/50 bg-${opt.color}-500/20 text-${opt.color}-400`
                    : 'border-stroke text-muted hover:text-fg'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Participação</label>
          <button
            onClick={() => setIsCombatant(!isCombatant)}
            className={`w-full mt-0.5 text-[10px] px-2 py-1 rounded border transition-colors ${
              isCombatant
                ? 'border-amber-500/50 bg-amber-500/20 text-amber-400'
                : 'border-stroke text-muted hover:text-fg'
            }`}
          >
            {isCombatant ? '⚔️ Combatente' : '🕊️ Não-combatente'}
          </button>
        </div>
      </div>

      {/* Version Label */}
      <div>
        <label className={labelClass}>Nome da Versão</label>
        <input value={versionLabel} onChange={e => setVersionLabel(e.target.value)} placeholder="Padrão" className={inputClass} />
      </div>

      {/* Creature Stats (if combatant) */}
      {isCombatant && (
        <div className="space-y-3 pt-2 border-t border-stroke/50">
          <div className="text-[10px] text-accent font-medium">Ficha de Combate</div>

          <div className="grid grid-cols-[1fr_80px] gap-2">
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={creatureType} onChange={e => setCreatureType(e.target.value as CreatureType)} className={inputClass}>
                {CREATURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>ND</label>
              <input type="number" value={nd} onChange={e => setNd(parseFloat(e.target.value) || 0)} step="0.5" min="0" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Tamanho</label>
              <select value={size} onChange={e => setSize(e.target.value as CreatureSize)} className={inputClass}>
                {CREATURE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Deslocamento</label>
              <input value={deslocamento} onChange={e => setDeslocamento(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelClass}>CA</label>
              <input type="number" value={ca} onChange={e => setCa(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PV</label>
              <input type="number" value={pv} onChange={e => setPv(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>

          {/* Attributes */}
          <div>
            <label className={labelClass}>Atributos</label>
            <div className="grid grid-cols-6 gap-1 mt-0.5">
              {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(attr => (
                <div key={attr} className="text-center">
                  <div className="text-[8px] text-muted uppercase">{attr}</div>
                  <input
                    type="number"
                    value={attrs[attr]}
                    onChange={e => setAttrs(p => ({ ...p, [attr]: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-surface border border-stroke rounded px-1 py-0.5 text-[10px] text-fg text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Resistances */}
          <div>
            <label className={labelClass}>Resistências</label>
            <div className="grid grid-cols-3 gap-2 mt-0.5">
              {([
                { key: 'fortitude' as const, label: 'Fort', color: 'text-green-400' },
                { key: 'reflexos' as const, label: 'Refl', color: 'text-blue-400' },
                { key: 'vontade' as const, label: 'Von', color: 'text-purple-400' },
              ]).map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-1">
                  <span className={`text-[10px] font-medium ${color}`}>{label}</span>
                  <input
                    type="number"
                    value={resists[key]}
                    onChange={e => setResists(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                    className="flex-1 bg-surface border border-stroke rounded px-1 py-0.5 text-[10px] text-fg text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Attacks */}
          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass}>Ataques</label>
              <button onClick={() => setAttacks(p => [...p, { ...EMPTY_ATTACK }])} className="text-[10px] text-accent hover:text-accent/80">+ Ataque</button>
            </div>
            <div className="space-y-1.5 mt-0.5">
              {attacks.map((atk, i) => (
                <div key={i} className="grid grid-cols-[1fr_50px_70px_auto] gap-1 items-end">
                  <input value={atk.name} onChange={e => updateAttack(i, 'name', e.target.value)} placeholder="Nome" className={inputClass} />
                  <input type="number" value={atk.bonus} onChange={e => updateAttack(i, 'bonus', parseInt(e.target.value) || 0)} placeholder="+0" className={inputClass} />
                  <input value={atk.damage} onChange={e => updateAttack(i, 'damage', e.target.value)} placeholder="1d8+3" className={inputClass} />
                  {attacks.length > 1 && (
                    <button onClick={() => setAttacks(p => p.filter((_, j) => j !== i))} className="text-[10px] text-red-400 hover:text-red-300 px-1 py-1">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Abilities + Senses */}
          <div>
            <label className={labelClass}>Habilidades (uma por linha)</label>
            <textarea value={abilities} onChange={e => setAbilities(e.target.value)} rows={2} placeholder="Habilidade especial" className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Sentidos</label>
            <input value={senses} onChange={e => setSenses(e.target.value)} placeholder="Visão no escuro 18m" className={inputClass} />
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-1 border-t border-stroke/50">
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="px-4 py-1.5 rounded text-xs font-medium bg-accent/20 text-accent
            hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Criar NPC
        </button>
      </div>
    </div>
  )
}
