import type { SoundDefinition, SoundCategory, SoundboardSlot } from '~/types/soundboard'
export type { SoundCategory }

export const SOUND_CATEGORIES: { id: SoundCategory; label: string; icon: string }[] = [
  { id: 'Ambiente', label: 'Ambiente', icon: '🌧️' },
  { id: 'Combate', label: 'Combate', icon: '⚔️' },
  { id: 'UI', label: 'UI', icon: '🔔' },
]

const B = 'https://assets.mixkit.co/active_storage/sfx'
const m = (id: number) => `${B}/${id}/${id}.wav`

export const SOUND_LIBRARY: SoundDefinition[] = [
  // ─── Ambiente (loop) ───
  {
    id: 'rain', name: 'Chuva', category: 'Ambiente', subcategory: 'Natureza', icon: '🌧️', loop: true,
    variants: [
      { id: 'rain-1', url: m(1250), label: 'Chuva moderada' },
      { id: 'rain-2', url: m(1253), label: 'Chuva leve' },
      { id: 'rain-3', url: m(1246), label: 'Chuva intensa' },
      { id: 'rain-4', url: m(1247), label: 'Chuva longa' },
    ],
  },
  {
    id: 'fire', name: 'Fogueira', category: 'Ambiente', subcategory: 'Natureza', icon: '🔥', loop: true,
    variants: [
      { id: 'fire-1', url: m(1330), label: 'Estalar' },
      { id: 'fire-2', url: m(1329), label: 'Queimando' },
      { id: 'fire-3', url: m(1331), label: 'Chamas grandes' },
      { id: 'fire-4', url: m(1335), label: 'Fogo forte' },
    ],
  },
  {
    id: 'forest', name: 'Floresta', category: 'Ambiente', subcategory: 'Natureza', icon: '🌲', loop: true,
    variants: [
      { id: 'forest-1', url: m(1210), label: 'Pássaros' },
      { id: 'forest-2', url: m(1212), label: 'Cantando' },
      { id: 'forest-3', url: m(1213), label: 'Europeia' },
      { id: 'forest-4', url: m(1228), label: 'Ambiente' },
    ],
  },
  {
    id: 'wind', name: 'Vento', category: 'Ambiente', subcategory: 'Natureza', icon: '💨', loop: true,
    variants: [
      { id: 'wind-1', url: m(1174), label: 'Vento forte' },
      { id: 'wind-2', url: m(1175), label: 'Vento de inverno' },
      { id: 'wind-3', url: m(1156), label: 'Rajada' },
      { id: 'wind-4', url: m(1153), label: 'Nevasca' },
    ],
  },
  {
    id: 'ocean', name: 'Oceano', category: 'Ambiente', subcategory: 'Natureza', icon: '🌊', loop: true,
    variants: [
      { id: 'ocean-1', url: m(1196), label: 'Ondas' },
      { id: 'ocean-2', url: m(1189), label: 'Ambiente' },
      { id: 'ocean-3', url: m(1194), label: 'Mar agitado' },
      { id: 'ocean-4', url: m(1195), label: 'Ondas próximas' },
      { id: 'ocean-5', url: m(1200), label: 'Mar com vento' },
    ],
  },
  {
    id: 'storm', name: 'Tempestade', category: 'Ambiente', subcategory: 'Natureza', icon: '⛈️', loop: true,
    variants: [
      { id: 'storm-1', url: m(2402), label: 'Trovão e chuva' },
      { id: 'storm-2', url: m(2395), label: 'Trovão distante' },
      { id: 'storm-3', url: m(2400), label: 'Chuva pesada' },
      { id: 'storm-4', url: m(2397), label: 'Trovoada clara' },
    ],
  },
  {
    id: 'night', name: 'Noite', category: 'Ambiente', subcategory: 'Natureza', icon: '🌙', loop: true,
    variants: [
      { id: 'night-1', url: m(2414), label: 'Insetos noturnos' },
      { id: 'night-2', url: m(1224), label: 'Floresta à noite' },
      { id: 'night-3', url: m(1227), label: 'Noite de verão' },
      { id: 'night-4', url: m(2475), label: 'Grilos' },
    ],
  },
  {
    id: 'waterfall', name: 'Cachoeira', category: 'Ambiente', subcategory: 'Natureza', icon: '💧', loop: true,
    variants: [
      { id: 'waterfall-1', url: m(2514), label: 'Na floresta' },
      { id: 'waterfall-2', url: m(2515), label: 'Grande' },
      { id: 'waterfall-3', url: m(2516), label: 'Fluindo' },
    ],
  },
  {
    id: 'tavern', name: 'Taverna', category: 'Ambiente', subcategory: 'Locais', icon: '🍺', loop: true,
    variants: [
      { id: 'tavern-1', url: m(2502), label: 'Fundo de restaurante' },
    ],
  },
  {
    id: 'dungeon', name: 'Masmorra', category: 'Ambiente', subcategory: 'Locais', icon: '🏚️', loop: true,
    variants: [
      { id: 'dungeon-1', url: m(2492), label: 'Caverna sinistra' },
      { id: 'dungeon-2', url: m(2499), label: 'Caverna úmida' },
      { id: 'dungeon-3', url: m(2500), label: 'Tumba' },
    ],
  },
  {
    id: 'city', name: 'Cidade', category: 'Ambiente', subcategory: 'Locais', icon: '🏘️', loop: true,
    variants: [
      { id: 'city-1', url: m(2505), label: 'Urbano diurno' },
      { id: 'city-2', url: m(2465), label: 'Ambiente urbano' },
      { id: 'city-3', url: m(2463), label: 'Tráfego' },
    ],
  },
  {
    id: 'wolves', name: 'Lobos', category: 'Ambiente', subcategory: 'Natureza', icon: '🐺', loop: true,
    variants: [
      { id: 'wolves-1', url: m(2485), label: 'Floresta assustadora' },
      { id: 'wolves-2', url: m(2483), label: 'Bosque sinistro' },
    ],
  },

  // ─── Combate (one-shot) ───
  {
    id: 'sword', name: 'Espada', category: 'Combate', subcategory: 'Armas', icon: '⚔️', loop: false,
    variants: [
      { id: 'sword-1', url: m(2762), label: 'Golpe em batalha' },
      { id: 'sword-2', url: m(2763), label: 'Cortes múltiplos' },
      { id: 'sword-3', url: m(2764), label: 'Golpe rápido' },
      { id: 'sword-4', url: m(2766), label: 'Lâmina medieval' },
      { id: 'sword-5', url: m(2788), label: 'Corte em carne' },
      { id: 'sword-6', url: m(2789), label: 'Impacto samurai' },
      { id: 'sword-7', url: m(2794), label: 'Golpe pesado' },
      { id: 'sword-8', url: m(2795), label: 'Metal pesado' },
    ],
  },
  {
    id: 'arrow', name: 'Flecha', category: 'Combate', subcategory: 'Armas', icon: '🏹', loop: false,
    variants: [
      { id: 'arrow-1', url: m(2771), label: 'Pelo ar' },
      { id: 'arrow-2', url: m(2767), label: 'Sibilo' },
      { id: 'arrow-3', url: m(2769), label: 'Impacto metal' },
      { id: 'arrow-4', url: m(2770), label: 'Impacto rápido' },
    ],
  },
  {
    id: 'explosion', name: 'Explosão', category: 'Combate', subcategory: 'Armas', icon: '💥', loop: false,
    variants: [
      { id: 'explosion-1', url: m(2809), label: 'Em batalha' },
      { id: 'explosion-2', url: m(2800), label: 'Bomba' },
      { id: 'explosion-3', url: m(2777), label: 'Massiva' },
      { id: 'explosion-4', url: m(2782), label: 'Épica distante' },
    ],
  },
  {
    id: 'magic', name: 'Magia', category: 'Combate', subcategory: 'Magias', icon: '✨', loop: false,
    variants: [
      { id: 'magic-1', url: m(2588), label: 'Feitiço de luz' },
      { id: 'magic-2', url: m(2581), label: 'Aura mágica' },
      { id: 'magic-3', url: m(2583), label: 'Transição' },
      { id: 'magic-4', url: m(2586), label: 'Varredura' },
      { id: 'magic-5', url: m(2587), label: 'Apito mágico' },
    ],
  },
  {
    id: 'fireball', name: 'Bola de Fogo', category: 'Combate', subcategory: 'Magias', icon: '🔥', loop: false,
    variants: [
      { id: 'fireball-1', url: m(1347), label: 'Feitiço' },
      { id: 'fireball-2', url: m(1332), label: 'Grande' },
      { id: 'fireball-3', url: m(1338), label: 'Com explosão' },
      { id: 'fireball-4', url: m(1339), label: 'Com trovão' },
      { id: 'fireball-5', url: m(1327), label: 'Rajada mágica' },
    ],
  },
  {
    id: 'warcry', name: 'Guerra', category: 'Combate', subcategory: 'Batalha', icon: '📢', loop: false,
    variants: [
      { id: 'warcry-1', url: m(2780), label: 'Tambores' },
      { id: 'warcry-2', url: m(2784), label: 'Tambores de guerra' },
      { id: 'warcry-3', url: m(2785), label: 'Trombeta de guerra' },
    ],
  },
  {
    id: 'pain', name: 'Dor', category: 'Combate', subcategory: 'Batalha', icon: '😣', loop: false,
    variants: [
      { id: 'pain-1', url: m(2768), label: 'Grito de dor' },
    ],
  },
  {
    id: 'creature', name: 'Criatura', category: 'Combate', subcategory: 'Batalha', icon: '👹', loop: false,
    variants: [
      { id: 'creature-1', url: m(2781), label: 'Rugido' },
    ],
  },
  {
    id: 'potion', name: 'Poção', category: 'Combate', subcategory: 'Magias', icon: '🧪', loop: false,
    variants: [
      { id: 'potion-1', url: m(2828), label: 'Beber poção' },
      { id: 'potion-2', url: m(2830), label: 'Poção mágica' },
    ],
  },
  {
    id: 'shield', name: 'Escudo', category: 'Combate', subcategory: 'Armas', icon: '🛡️', loop: false,
    variants: [
      { id: 'shield-1', url: m(2775), label: 'Golpe em armadura' },
      { id: 'shield-2', url: m(2774), label: 'Machado em placa' },
    ],
  },

  // ─── UI (one-shot) ───
  {
    id: 'victory', name: 'Vitória', category: 'UI', icon: '🏆', loop: false,
    variants: [
      { id: 'victory-1', url: m(2015), label: 'Sinos' },
      { id: 'victory-2', url: m(2016), label: 'Game win' },
      { id: 'victory-3', url: m(2019), label: 'Mágica' },
    ],
  },
  {
    id: 'defeat', name: 'Derrota', category: 'UI', icon: '💀', loop: false,
    variants: [
      { id: 'defeat-1', url: m(2028), label: 'Horror' },
      { id: 'defeat-2', url: m(2023), label: 'Tambores' },
      { id: 'defeat-3', url: m(2024), label: 'Piano' },
    ],
  },
  {
    id: 'dramatic', name: 'Revelação', category: 'UI', icon: '🎭', loop: false,
    variants: [
      { id: 'dramatic-1', url: m(2901), label: 'Impacto épico' },
      { id: 'dramatic-2', url: m(2898), label: 'Suspense' },
      { id: 'dramatic-3', url: m(2904), label: 'Transição épica' },
      { id: 'dramatic-4', url: m(2896), label: 'Intro de filme' },
    ],
  },
  {
    id: 'suspense', name: 'Suspense', category: 'UI', icon: '😰', loop: false,
    variants: [
      { id: 'suspense-1', url: m(2898) },
      { id: 'suspense-2', url: m(2910) },
    ],
  },
]

// Default soundboard layout
export const DEFAULT_SOUNDBOARD_SLOTS: SoundboardSlot[] = [
  { id: 'slot-rain', soundId: 'rain', isCustom: false, preferredVariantId: null, order: 0 },
  { id: 'slot-fire', soundId: 'fire', isCustom: false, preferredVariantId: null, order: 1 },
  { id: 'slot-tavern', soundId: 'tavern', isCustom: false, preferredVariantId: null, order: 2 },
  { id: 'slot-forest', soundId: 'forest', isCustom: false, preferredVariantId: null, order: 3 },
  { id: 'slot-dungeon', soundId: 'dungeon', isCustom: false, preferredVariantId: null, order: 4 },
  { id: 'slot-storm', soundId: 'storm', isCustom: false, preferredVariantId: null, order: 5 },
  { id: 'slot-sword', soundId: 'sword', isCustom: false, preferredVariantId: null, order: 6 },
  { id: 'slot-magic', soundId: 'magic', isCustom: false, preferredVariantId: null, order: 7 },
  { id: 'slot-fireball', soundId: 'fireball', isCustom: false, preferredVariantId: null, order: 8 },
  { id: 'slot-arrow', soundId: 'arrow', isCustom: false, preferredVariantId: null, order: 9 },
  { id: 'slot-explosion', soundId: 'explosion', isCustom: false, preferredVariantId: null, order: 10 },
  { id: 'slot-victory', soundId: 'victory', isCustom: false, preferredVariantId: null, order: 11 },
]

// Backward compat alias (used by old imports)
export type SoundEffect = {
  id: string
  name: string
  category: SoundCategory
  url: string
  icon: string
  loop: boolean
}

export const SOUND_EFFECTS: SoundEffect[] = SOUND_LIBRARY.map(s => ({
  id: s.id,
  name: s.name,
  category: s.category,
  url: s.variants[0].url,
  icon: s.icon,
  loop: s.loop,
}))
