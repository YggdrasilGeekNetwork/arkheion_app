import { useState } from 'react'
import type { PlaylistDefinition } from '~/types/soundboard'

type AddPlaylistModalProps = {
  onAdd: (playlist: PlaylistDefinition) => void
  onClose: () => void
}

function detectType(url: string): 'spotify' | 'youtube' | null {
  if (/open\.spotify\.com/.test(url)) return 'spotify'
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  return null
}

export default function AddPlaylistModal({ onAdd, onClose }: AddPlaylistModalProps) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    const trimmedUrl = url.trim()
    const trimmedName = name.trim()

    if (!trimmedUrl) { setError('URL obrigatória'); return }

    const type = detectType(trimmedUrl)
    if (!type) { setError('Use links do Spotify ou YouTube'); return }

    if (!trimmedName) { setError('Nome obrigatório'); return }

    onAdd({
      id: `pl-custom-${Date.now()}`,
      name: trimmedName,
      url: trimmedUrl,
      icon: type === 'spotify' ? '🎵' : '▶️',
      type,
    })
    onClose()
  }

  return (
    <div className="border border-accent/30 rounded p-1.5 space-y-1 bg-surface/30">
      <div className="text-[11px] text-accent font-medium">Adicionar Playlist</div>

      <input
        value={url}
        onChange={e => { setUrl(e.target.value); setError(null) }}
        placeholder="URL do Spotify ou YouTube..."
        className="w-full bg-surface/50 border border-stroke rounded px-1.5 py-1
          text-xs text-fg placeholder:text-muted/40 outline-none
          focus:border-accent/40 transition-colors"
      />

      <input
        value={name}
        onChange={e => { setName(e.target.value); setError(null) }}
        placeholder="Nome da playlist"
        className="w-full bg-surface/50 border border-stroke rounded px-1.5 py-1
          text-xs text-fg placeholder:text-muted/40 outline-none
          focus:border-accent/40 transition-colors"
      />

      <div className="flex items-center gap-2 justify-end">
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
