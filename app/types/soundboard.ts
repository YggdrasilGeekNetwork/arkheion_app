export type SoundCategory = 'Ambiente' | 'Combate' | 'UI'

export type SoundVariant = {
  id: string
  url: string
  label?: string
}

export type SoundDefinition = {
  id: string
  name: string
  category: SoundCategory
  subcategory?: string
  icon: string
  loop: boolean
  variants: SoundVariant[]
}

export type CustomSound = {
  id: string
  name: string
  url: string
  icon: string
  loop: boolean
  category: SoundCategory
  createdAt: string
}

export type SoundboardSlot = {
  id: string
  soundId: string
  isCustom: boolean
  preferredVariantId: string | null
  order: number
}

export type RecentMediaEntry = {
  url: string
  label: string
  type: 'spotify' | 'youtube'
}

export type SoundboardConfig = {
  slots: SoundboardSlot[]
  customSounds: CustomSound[]
  recentMedia: RecentMediaEntry[]
}
