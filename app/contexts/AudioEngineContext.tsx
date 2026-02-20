import { createContext, useContext } from 'react'
import type { AudioEngine } from '~/components/dm/tools/soundboard/useAudioEngine'

const AudioEngineContext = createContext<AudioEngine | null>(null)

export const AudioEngineProvider = AudioEngineContext.Provider

export function useAudioEngineContext(): AudioEngine {
  const ctx = useContext(AudioEngineContext)
  if (!ctx) throw new Error('useAudioEngineContext must be used within AudioEngineProvider')
  return ctx
}
