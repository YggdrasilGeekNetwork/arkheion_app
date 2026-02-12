import { useState } from 'react'
import type { SoundCategory, CustomSound } from '~/types/soundboard'

type AddCustomSoundModalProps = {
  onAdd: (sound: CustomSound) => void
  onClose: () => void
}

export default function AddCustomSoundModal({ onAdd, onClose }: AddCustomSoundModalProps) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<SoundCategory>('Ambiente')
  const [loop, setLoop] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    const trimmedUrl = url.trim()
    const trimmedName = name.trim()

    if (!trimmedUrl) { setError('URL obrigatória'); return }
    if (!trimmedName) { setError('Nome obrigatório'); return }

    onAdd({
      id: `custom-${Date.now()}`,
      name: trimmedName,
      url: trimmedUrl,
      icon: '🔊',
      loop,
      category,
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="border border-accent/30 rounded p-1.5 space-y-1 bg-surface/30">
      <div className="text-[11px] text-accent font-medium">Adicionar Som</div>

      <input
        value={url}
        onChange={e => { setUrl(e.target.value); setError(null) }}
        placeholder="URL do áudio (mp3, wav, ogg...)"
        className="w-full bg-surface/50 border border-stroke rounded px-1.5 py-1
          text-xs text-fg placeholder:text-muted/40 outline-none
          focus:border-accent/40 transition-colors"
      />

      <input
        value={name}
        onChange={e => { setName(e.target.value); setError(null) }}
        placeholder="Nome do som"
        className="w-full bg-surface/50 border border-stroke rounded px-1.5 py-1
          text-xs text-fg placeholder:text-muted/40 outline-none
          focus:border-accent/40 transition-colors"
      />

      <div className="flex items-center gap-2">
        <select
          value={category}
          onChange={e => setCategory(e.target.value as SoundCategory)}
          className="bg-surface/50 border border-stroke rounded px-1 py-0.5
            text-xs text-fg outline-none"
        >
          <option value="Ambiente">Ambiente</option>
          <option value="Combate">Combate</option>
          <option value="UI">UI</option>
        </select>

        <label className="flex items-center gap-1 text-xs text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={loop}
            onChange={e => setLoop(e.target.checked)}
            className="w-3 h-3 accent-accent"
          />
          Loop
        </label>

        <div className="flex-1" />

        <button
          onClick={onClose}
          className="text-xs text-muted hover:text-fg px-1.5 py-0.5 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="text-xs font-medium text-accent bg-accent/15
            border border-accent/40 rounded px-2 py-0.5
            hover:bg-accent/25 transition-colors"
        >
          Adicionar
        </button>
      </div>

      {error && <div className="text-[11px] text-red-400">{error}</div>}
    </div>
  )
}
