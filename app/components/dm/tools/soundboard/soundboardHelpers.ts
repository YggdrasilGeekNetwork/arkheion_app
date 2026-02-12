import { SOUND_LIBRARY } from '~/data/soundEffects'
import type { SoundDefinition, SoundVariant, SoundboardSlot, CustomSound } from '~/types/soundboard'

export function resolveSound(slot: SoundboardSlot, customSounds: CustomSound[]): SoundDefinition | null {
  if (slot.isCustom) {
    const custom = customSounds.find(s => s.id === slot.soundId)
    if (!custom) return null
    return {
      id: custom.id,
      name: custom.name,
      category: custom.category,
      icon: custom.icon,
      loop: custom.loop,
      variants: [{ id: custom.id, url: custom.url }],
    }
  }
  return SOUND_LIBRARY.find(s => s.id === slot.soundId) ?? null
}

export function resolveVariant(sound: SoundDefinition, preferredVariantId: string | null): SoundVariant {
  if (preferredVariantId) {
    const found = sound.variants.find(v => v.id === preferredVariantId)
    if (found) return found
  }
  return sound.variants[Math.floor(Math.random() * sound.variants.length)]
}
