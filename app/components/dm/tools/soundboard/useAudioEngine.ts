import { useState, useEffect, useRef, useCallback } from 'react'

type ActiveSound = {
  audio: HTMLAudioElement
  volume: number
  soundId: string
  variantId: string
}

export type AudioEngine = {
  activeSounds: Map<string, ActiveSound>
  play: (soundId: string, url: string, loop: boolean, variantId: string) => void
  stop: (soundId: string) => void
  stopAll: () => void
  setVolume: (soundId: string, volume: number) => void
  setMasterVolume: (volume: number) => void
  isPlaying: (soundId: string) => boolean
  getVolume: (soundId: string) => number
  getActiveVariantId: (soundId: string) => string | undefined
  masterVolume: number
  activePlaylistId: string | null
  setActivePlaylistId: (id: string | null) => void
}

export function useAudioEngine(): AudioEngine {
  const [activeSounds, setActiveSounds] = useState<Map<string, ActiveSound>>(new Map())
  const [masterVolume, setMasterVolumeState] = useState(0.7)
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
  const activeSoundsRef = useRef(activeSounds)
  const masterVolumeRef = useRef(masterVolume)
  activeSoundsRef.current = activeSounds
  masterVolumeRef.current = masterVolume

  useEffect(() => {
    return () => {
      activeSoundsRef.current.forEach(s => {
        s.audio.pause()
        s.audio.src = ''
      })
    }
  }, [])

  const play = useCallback((soundId: string, url: string, loop: boolean, variantId: string) => {
    // Stop existing if playing
    const existing = activeSoundsRef.current.get(soundId)
    if (existing) {
      existing.audio.pause()
      existing.audio.src = ''
    }

    const audio = new Audio(url)
    audio.loop = loop
    audio.volume = 0.7 * masterVolumeRef.current

    audio.play().catch(err => {
      console.warn('Audio play failed:', err)
    })

    if (!loop) {
      audio.addEventListener('ended', () => {
        setActiveSounds(prev => {
          const next = new Map(prev)
          next.delete(soundId)
          return next
        })
      })
    }

    setActiveSounds(prev => {
      const next = new Map(prev)
      next.set(soundId, { audio, volume: 0.7, soundId, variantId })
      return next
    })
  }, [])

  const stop = useCallback((soundId: string) => {
    const existing = activeSoundsRef.current.get(soundId)
    if (existing) {
      existing.audio.pause()
      existing.audio.src = ''
      setActiveSounds(prev => {
        const next = new Map(prev)
        next.delete(soundId)
        return next
      })
    }
  }, [])

  const stopAll = useCallback(() => {
    activeSoundsRef.current.forEach(s => {
      s.audio.pause()
      s.audio.src = ''
    })
    setActiveSounds(new Map())
  }, [])

  const setVolume = useCallback((soundId: string, volume: number) => {
    const existing = activeSoundsRef.current.get(soundId)
    if (existing) {
      existing.volume = volume
      existing.audio.volume = volume * masterVolumeRef.current
      setActiveSounds(prev => {
        const next = new Map(prev)
        next.set(soundId, { ...existing, volume })
        return next
      })
    }
  }, [])

  const setMasterVolume = useCallback((vol: number) => {
    setMasterVolumeState(vol)
    masterVolumeRef.current = vol
    activeSoundsRef.current.forEach(s => {
      s.audio.volume = s.volume * vol
    })
  }, [])

  const isPlaying = useCallback((soundId: string) => {
    return activeSounds.has(soundId)
  }, [activeSounds])

  const getVolume = useCallback((soundId: string) => {
    return activeSounds.get(soundId)?.volume ?? 0.7
  }, [activeSounds])

  const getActiveVariantId = useCallback((soundId: string) => {
    return activeSounds.get(soundId)?.variantId
  }, [activeSounds])

  return {
    activeSounds,
    play, stop, stopAll,
    setVolume, setMasterVolume,
    isPlaying, getVolume, getActiveVariantId,
    masterVolume,
    activePlaylistId,
    setActivePlaylistId,
  }
}
