type MusicPlayerProps = {
  activeUrl: string | null
  onClose: () => void
}

function parseEmbedUrl(url: string): { type: 'spotify' | 'youtube'; embedUrl: string } | null {
  // Spotify
  const spotifyMatch = url.match(/open\.spotify\.com\/(playlist|album|track|episode)\/([a-zA-Z0-9]+)/)
  if (spotifyMatch) {
    return {
      type: 'spotify',
      embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?theme=0`,
    }
  }

  // YouTube playlist
  const ytPlaylist = url.match(/youtube\.com\/.*[?&]list=([a-zA-Z0-9_-]+)/)
  if (ytPlaylist) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${ytPlaylist[1]}`,
    }
  }

  // YouTube video
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    }
  }

  return null
}

export default function MusicPlayer({ activeUrl, onClose }: MusicPlayerProps) {
  if (!activeUrl) return null

  const parsed = parseEmbedUrl(activeUrl)
  if (!parsed) return null

  return (
    <div className="relative">
      <button
        onClick={onClose}
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
  )
}
