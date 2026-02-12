import { useState } from 'react'
import type { CampaignObject, CampaignObjectType, ObjectRarity } from '~/types/encounter'
import { CAMPAIGN_OBJECT_TYPES, OBJECT_RARITY_INFO } from '~/types/encounter'

type ObjectFormProps = {
  onAdd: (object: CampaignObject) => void
}

export default function ObjectForm({ onAdd }: ObjectFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<CampaignObjectType>('other')
  const [description, setDescription] = useState('')
  const [rarity, setRarity] = useState<ObjectRarity>('common')
  const [value, setValue] = useState('')
  const [properties, setProperties] = useState('')

  function handleSubmit() {
    if (!name.trim()) return

    const now = new Date().toISOString()
    const object: CampaignObject = {
      id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      rarity,
      value: value.trim() || undefined,
      properties: properties.split('\n').map(s => s.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    }
    onAdd(object)
  }

  const inputClass = 'w-full bg-surface border border-stroke rounded px-1.5 py-1 text-[10px] text-fg'
  const labelClass = 'text-[10px] text-muted font-medium'

  return (
    <div className="space-y-3 overflow-y-auto">
      {/* Name */}
      <div>
        <label className={labelClass}>Nome *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do objeto" className={inputClass} />
      </div>

      {/* Type + Rarity */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Tipo</label>
          <select value={type} onChange={e => setType(e.target.value as CampaignObjectType)} className={inputClass}>
            {CAMPAIGN_OBJECT_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Raridade</label>
          <select value={rarity} onChange={e => setRarity(e.target.value as ObjectRarity)} className={inputClass}>
            {(Object.entries(OBJECT_RARITY_INFO) as [ObjectRarity, { label: string }][]).map(([key, info]) => (
              <option key={key} value={key}>{info.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Value */}
      <div>
        <label className={labelClass}>Valor</label>
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="100 TO" className={inputClass} />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Descrição</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Descrição do objeto..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Properties */}
      <div>
        <label className={labelClass}>Propriedades (uma por linha)</label>
        <textarea
          value={properties}
          onChange={e => setProperties(e.target.value)}
          rows={2}
          placeholder="+1 de ataque&#10;Flamejante (1d6 fogo)"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-1 border-t border-stroke/50">
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="px-4 py-1.5 rounded text-xs font-medium bg-accent/20 text-accent
            hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Criar Objeto
        </button>
      </div>
    </div>
  )
}
