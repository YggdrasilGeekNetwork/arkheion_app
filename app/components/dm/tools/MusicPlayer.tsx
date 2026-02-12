import { useState } from 'react'

export type RecentMedia = {
  url: string
  label: string
  type: 'spotify' | 'youtube'
}

type MusicPlayerProps = {
  recentMedia: RecentMedia[]
  onMediaAdd: (media: RecentMedia) => void
}

const SPOTIFY_LABELS: Record<string, string> = {
  playlist: 'Playlist',
  album: 'Álbum',
  track: 'Música',
  episode: 'Episódio',
}

function parseEmbedUrl(url: string): { type: 'spotify' | 'youtube'; embedUrl: string; label: string } | null {
  // Spotify
  const spotifyMatch = url.match(/open\.spotify\.com\/(playlist|album|track|episode)\/([a-zA-Z0-9]+)/)
  if (spotifyMatch) {
    return {
      type: 'spotify',
      embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?theme=0`,
      label: SPOTIFY_LABELS[spotifyMatch[1]] || 'Spotify',
    }
  }

  // YouTube - various URL formats
  let videoId: string | null = null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) videoId = ytMatch[1]

  // YouTube playlist
  const ytPlaylist = url.match(/youtube\.com\/.*[?&]list=([a-zA-Z0-9_-]+)/)
  if (ytPlaylist) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${ytPlaylist[1]}`,
      label: 'YT Playlist',
    }
  }

  if (videoId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      label: 'YouTube',
    }
  }

  return null
}

export default function MusicPlayer({ recentMedia, onMediaAdd }: MusicPlayerProps) {
  const [urlInput, setUrlInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [activeUrl, setActiveUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parsed = activeUrl ? parseEmbedUrl(activeUrl) : null

  function handleLoad() {
    const url = urlInput.trim()
    if (!url) return

    const result = parseEmbedUrl(url)
    if (!result) {
      setError('URL não reconhecida. Use links do Spotify ou YouTube.')
      return
    }

    setActiveUrl(url)
    setError(null)
    onMediaAdd({
      url,
      label: nameInput.trim() || result.label,
      type: result.type,
    })
    setUrlInput('')
    setNameInput('')
  }

  function handleRecent(media: RecentMedia) {
    setActiveUrl(media.url)
    setError(null)
  }

  return (
    <div className="space-y-1.5">
      <div className="text-[11px] text-muted uppercase tracking-wider font-medium">
        Playlist / Música
      </div>

      {/* URL input */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">
          <input
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="Colar URL do Spotify ou YouTube..."
            className="flex-1 bg-surface/50 border border-stroke rounded px-1.5 py-1
              text-xs text-fg placeholder:text-muted/40 outline-none
              focus:border-accent/40 transition-colors"
          />
          <button
            onClick={handleLoad}
            className="px-2 py-1 rounded text-xs font-medium
              bg-accent/15 text-accent border border-accent/40
              hover:bg-accent/25 transition-colors flex-shrink-0"
          >
            Tocar
          </button>
        </div>
        {urlInput && (
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="Nome (opcional, ex: Taverna Medieval)"
            className="bg-surface/50 border border-stroke rounded px-1.5 py-1
              text-xs text-fg placeholder:text-muted/40 outline-none
              focus:border-accent/40 transition-colors"
          />
        )}
      </div>

      {error && (
        <div className="text-[11px] text-red-400">{error}</div>
      )}

      {/* Recent media */}
      {recentMedia.length > 0 && !parsed && (
        <div className="flex gap-1 flex-wrap">
          {recentMedia.map((media, i) => (
            <button
              key={i}
              onClick={() => handleRecent(media)}
              className="text-[11px] text-muted hover:text-accent px-1.5 py-0.5
                bg-surface/50 border border-stroke rounded hover:border-accent/30 transition-colors
                truncate max-w-[140px]"
            >
              {media.type === 'spotify' ? '🎵' : '▶️'} {media.label}
            </button>
          ))}
        </div>
      )}

      {/* Embed */}
      {parsed && (
        <div className="relative">
          <button
            onClick={() => setActiveUrl(null)}
            className="absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full
              bg-bg border border-stroke text-[11px] text-muted hover:text-fg
              flex items-center justify-center"
          >
            ✕
          </button>
          <iframe
            src={parsed.embedUrl}
            width="100%"
            height={parsed.type === 'spotify' ? 80 : 120}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-md"
          />
        </div>
      )}
    </div>
  )
}
