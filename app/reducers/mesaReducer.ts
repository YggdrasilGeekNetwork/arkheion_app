import type { Character } from '~/types/character'
import type {
  Campaign, Adventure, Session, Encounter, DrawnCard, EncounterEnemy,
  NPC, NPCVersion, EncounterNPC, CampaignObject, EncounterObject, Reward,
} from '~/types/encounter'
import type { MesaWithCharacters, PartySnapshotField } from '~/types/mesa'
import type { Note, NoteFolder, NoteLink } from '~/types/notes'
import type { SoundboardConfig, SoundboardSlot, CustomSound, RecentMediaEntry, PlaylistSlot, PlaylistDefinition } from '~/types/soundboard'
import type { CombatState, InitiativeEntry } from '~/types/combat'
import { DEFAULT_SOUNDBOARD_SLOTS, DEFAULT_PLAYLIST_SLOTS } from '~/data/soundEffects'

export type MesaAction =
  | { type: 'SET_MESA'; payload: MesaWithCharacters }
  | { type: 'CLEAR_MESA' }
  | { type: 'UPDATE_CHARACTER'; payload: { characterId: string; data: Partial<Character> } }
  | { type: 'SET_SNAPSHOT_FIELDS'; payload: PartySnapshotField[] }
  | { type: 'TOGGLE_FIELD_VISIBILITY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  // Campaigns
  | { type: 'CREATE_CAMPAIGN'; payload: { name: string; description?: string } }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'SET_ACTIVE_CAMPAIGN'; payload: string | null }
  // Adventures
  | { type: 'CREATE_ADVENTURE'; payload: { name: string; description?: string } }
  | { type: 'DELETE_ADVENTURE'; payload: string }
  | { type: 'SET_ACTIVE_ADVENTURE'; payload: string | null }
  // Sessions
  | { type: 'CREATE_SESSION'; payload: { name: string; number: number; date?: string } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_ACTIVE_SESSION'; payload: string | null }
  // Encounters
  | { type: 'CREATE_ENCOUNTER'; payload: { name: string; description?: string } }
  | { type: 'DELETE_ENCOUNTER'; payload: string }
  | { type: 'SET_ACTIVE_ENCOUNTER'; payload: string | null }
  | { type: 'UPDATE_ENCOUNTER'; payload: { id: string; data: Partial<Encounter> } }
  | { type: 'ADD_CARD_TO_ADVENTURE'; payload: { card: DrawnCard } }
  | { type: 'REMOVE_CARD_FROM_ADVENTURE'; payload: { cardIndex: number } }
  | { type: 'CLEAR_ADVENTURE_CARDS' }
  // Enemies
  | { type: 'ADD_ENEMY_TO_ENCOUNTER'; payload: { enemy: EncounterEnemy } }
  | { type: 'REMOVE_ENEMY_FROM_ENCOUNTER'; payload: { enemyId: string } }
  | { type: 'UPDATE_ENEMY_IN_ENCOUNTER'; payload: { enemyId: string; updates: Partial<EncounterEnemy> } }
  // Campaign NPCs
  | { type: 'CREATE_NPC'; payload: { npc: NPC } }
  | { type: 'UPDATE_NPC'; payload: { npcId: string; updates: Partial<NPC> } }
  | { type: 'DELETE_NPC'; payload: { npcId: string } }
  | { type: 'ADD_NPC_VERSION'; payload: { npcId: string; version: NPCVersion } }
  | { type: 'UPDATE_NPC_VERSION'; payload: { npcId: string; versionId: string; updates: Partial<NPCVersion> } }
  | { type: 'DELETE_NPC_VERSION'; payload: { npcId: string; versionId: string } }
  // Encounter NPCs
  | { type: 'ADD_NPC_TO_ENCOUNTER'; payload: { encounterNpc: EncounterNPC } }
  | { type: 'REMOVE_NPC_FROM_ENCOUNTER'; payload: { encounterNpcId: string } }
  | { type: 'UPDATE_NPC_IN_ENCOUNTER'; payload: { encounterNpcId: string; updates: Partial<EncounterNPC> } }
  // Campaign Objects
  | { type: 'CREATE_OBJECT'; payload: { object: CampaignObject } }
  | { type: 'UPDATE_OBJECT'; payload: { objectId: string; updates: Partial<CampaignObject> } }
  | { type: 'DELETE_OBJECT'; payload: { objectId: string } }
  // Encounter Objects
  | { type: 'ADD_OBJECT_TO_ENCOUNTER'; payload: { encounterObject: EncounterObject } }
  | { type: 'REMOVE_OBJECT_FROM_ENCOUNTER'; payload: { encounterObjectId: string } }
  | { type: 'UPDATE_OBJECT_IN_ENCOUNTER'; payload: { encounterObjectId: string; updates: Partial<EncounterObject> } }
  // Rewards
  | { type: 'ADD_REWARD'; payload: { reward: Reward } }
  | { type: 'UPDATE_REWARD'; payload: { rewardId: string; updates: Partial<Reward> } }
  | { type: 'REMOVE_REWARD'; payload: { rewardId: string } }
  | { type: 'TOGGLE_REWARD_DISTRIBUTED'; payload: { rewardId: string } }
  // Notes
  | { type: 'CREATE_NOTE'; payload: { note: Note } }
  | { type: 'UPDATE_NOTE'; payload: { noteId: string; updates: Partial<Note> } }
  | { type: 'DELETE_NOTE'; payload: { noteId: string } }
  | { type: 'SET_ACTIVE_NOTE'; payload: { noteId: string | null } }
  | { type: 'TOGGLE_NOTE_PIN'; payload: { noteId: string } }
  | { type: 'MOVE_NOTE_TO_FOLDER'; payload: { noteId: string; folderId: string | null } }
  | { type: 'ADD_NOTE_LINK'; payload: { noteId: string; link: NoteLink } }
  | { type: 'REMOVE_NOTE_LINK'; payload: { noteId: string; linkType: string; linkId: string } }
  // Note Folders
  | { type: 'CREATE_NOTE_FOLDER'; payload: { folder: NoteFolder } }
  | { type: 'RENAME_NOTE_FOLDER'; payload: { folderId: string; name: string } }
  | { type: 'DELETE_NOTE_FOLDER'; payload: { folderId: string } }
  | { type: 'SET_ACTIVE_FOLDER'; payload: { folderId: string | null } }
  // Soundboard
  | { type: 'ADD_SOUNDBOARD_SLOT'; payload: { slot: SoundboardSlot } }
  | { type: 'REMOVE_SOUNDBOARD_SLOT'; payload: { slotId: string } }
  | { type: 'REORDER_SOUNDBOARD_SLOTS'; payload: { slots: SoundboardSlot[] } }
  | { type: 'UPDATE_SOUNDBOARD_SLOT'; payload: { slotId: string; updates: Partial<SoundboardSlot> } }
  | { type: 'ADD_CUSTOM_SOUND'; payload: { sound: CustomSound } }
  | { type: 'REMOVE_CUSTOM_SOUND'; payload: { soundId: string } }
  | { type: 'ADD_RECENT_MEDIA'; payload: { media: RecentMediaEntry } }
  // Playlists
  | { type: 'ADD_PLAYLIST_SLOT'; payload: { slot: PlaylistSlot } }
  | { type: 'REMOVE_PLAYLIST_SLOT'; payload: { slotId: string } }
  | { type: 'ADD_CUSTOM_PLAYLIST'; payload: { playlist: PlaylistDefinition } }
  | { type: 'REMOVE_CUSTOM_PLAYLIST'; payload: { playlistId: string } }
  // Combat
  | { type: 'START_COMBAT'; payload: { encounterId: string; initiativeOrder: InitiativeEntry[] } }
  | { type: 'END_COMBAT' }
  | { type: 'SET_INITIATIVE'; payload: { entryId: string; initiative: number } }
  | { type: 'NEXT_TURN' }
  | { type: 'PREVIOUS_TURN' }
  | { type: 'UPDATE_COMBAT_ENTRY'; payload: { entryId: string; updates: Partial<InitiativeEntry> } }
  | { type: 'ADD_COMBAT_ENTRY'; payload: { entry: InitiativeEntry } }
  | { type: 'REMOVE_COMBAT_ENTRY'; payload: { entryId: string } }
  | { type: 'RESTORE_COMBAT'; payload: CombatState }
  // Navigation
  | { type: 'NAVIGATE_BACK' }
  | { type: 'NAVIGATE_TO_ENCOUNTER'; payload: { adventureId: string; sessionId: string; encounterId: string } }

export type MesaState = {
  mesa: MesaWithCharacters | null
  snapshotFields: PartySnapshotField[]
  campaigns: Campaign[]
  activeCampaignId: string | null
  activeAdventureId: string | null
  activeSessionId: string | null
  activeEncounterId: string | null
  combatState: CombatState | null
  notes: Note[]
  noteFolders: NoteFolder[]
  activeNoteId: string | null
  activeFolderId: string | null
  soundboard: SoundboardConfig
  isLoading: boolean
  error: string | null
}

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-demo-1',
    name: 'A Maldição de Moreania',
    description: 'Uma campanha sombria nas terras amaldiçoadas de Moreania',
    adventures: [
      {
        id: 'adv-demo-1',
        name: 'O Despertar da Floresta',
        description: 'Os heróis investigam desaparecimentos misteriosos na Floresta Sombria',
        drawnCards: [
          {
            id: 'drawn-demo-1', type: 'threat', name: 'Humanoides',
            description: 'Humanoides hostis', drawnAt: '2025-01-15T20:00:00Z',
            method: 'nimb', tier: 1,
          },
          {
            id: 'drawn-demo-2', type: 'location', name: 'Ermos',
            description: 'Região selvagem e desabitada', drawnAt: '2025-01-15T20:01:00Z',
            method: 'khalmyr',
          },
          {
            id: 'drawn-demo-3', type: 'event', name: 'Encontro',
            description: 'Os personagens se deparam com algo inesperado',
            drawnAt: '2025-01-15T22:10:00Z', method: 'nimb',
          },
        ],
        sessions: [
          {
            id: 'sess-demo-1',
            name: 'A Taverna do Último Suspiro',
            number: 1,
            date: '2025-01-15',
            encounters: [
              {
                id: 'enc-demo-1',
                name: 'Emboscada Goblin',
                description: 'Goblins atacam o grupo na estrada',
                status: 'completed',
                enemies: [
                  {
                    id: 'enemy-demo-1', creatureId: 'goblin',
                    creature: {
                      id: 'goblin', name: 'Goblin', nd: 0.5, type: 'Humanoide', size: 'Pequeno',
                      ca: 15, pv: 6, deslocamento: '9m',
                      attributes: { for: 8, des: 14, con: 10, int: 10, sab: 10, car: 8 },
                      resistances: { fortitude: 1, reflexos: 4, vontade: 0 },
                      attacks: [{ name: 'Adaga', bonus: 4, damage: '1d4+2', type: 'perfuração' }],
                      abilities: ['Ataque Furtivo +1d6', 'Evasão'],
                      senses: 'Visão no escuro 9m', treasure: 'Padrão',
                    },
                    nickname: 'Goblin #1', currentPv: 0, addedAt: '2025-01-15T20:05:00Z',
                  },
                  {
                    id: 'enemy-demo-2', creatureId: 'goblin',
                    creature: {
                      id: 'goblin', name: 'Goblin', nd: 0.5, type: 'Humanoide', size: 'Pequeno',
                      ca: 15, pv: 6, deslocamento: '9m',
                      attributes: { for: 8, des: 14, con: 10, int: 10, sab: 10, car: 8 },
                      resistances: { fortitude: 1, reflexos: 4, vontade: 0 },
                      attacks: [{ name: 'Adaga', bonus: 4, damage: '1d4+2', type: 'perfuração' }],
                      abilities: ['Ataque Furtivo +1d6', 'Evasão'],
                      senses: 'Visão no escuro 9m', treasure: 'Padrão',
                    },
                    nickname: 'Goblin #2', currentPv: 0, addedAt: '2025-01-15T20:05:01Z',
                  },
                  {
                    id: 'enemy-demo-3', creatureId: 'hobgoblin',
                    creature: {
                      id: 'hobgoblin', name: 'Hobgoblin', nd: 1, type: 'Humanoide', size: 'Médio',
                      ca: 16, pv: 14, deslocamento: '9m',
                      attributes: { for: 14, des: 12, con: 14, int: 10, sab: 10, car: 10 },
                      resistances: { fortitude: 4, reflexos: 2, vontade: 1 },
                      attacks: [{ name: 'Espada longa', bonus: 4, damage: '1d8+2', type: 'corte' }],
                      abilities: ['Formação Marcial (+1 ataque e CA se aliado adjacente)', 'Disciplinado'],
                      senses: 'Visão no escuro 18m', treasure: 'Padrão',
                    },
                    nickname: 'Líder Hobgoblin', currentPv: 3, addedAt: '2025-01-15T20:05:02Z',
                  },
                ],
                encounterNpcs: [
                  { id: 'enc-npc-1', npcId: 'npc-demo-1', versionId: 'npc-ver-1', notes: 'Elara guia o grupo pela estrada' },
                  { id: 'enc-npc-2', npcId: 'npc-demo-3', versionId: 'npc-ver-3', notes: 'Thoren avisa sobre os goblins' },
                ],
                encounterObjects: [
                  { id: 'enc-obj-1', objectId: 'obj-demo-2', quantity: 2, notes: 'Encontradas nos goblins' },
                ],
                rewards: [
                  { id: 'rew-1', type: 'gold', name: 'Ouro dos Goblins', value: 50, distributed: true },
                  { id: 'rew-2', type: 'item', name: 'Poção de Cura', objectId: 'obj-demo-2', quantity: 2, distributed: false },
                ],
                createdAt: '2025-01-15T19:30:00Z',
                updatedAt: '2025-01-15T22:00:00Z',
              },
              {
                id: 'enc-demo-2',
                name: 'A Clareira Corrompida',
                description: 'Mortos-vivos emergem de uma clareira amaldiçoada',
                status: 'ready',
                enemies: [
                  {
                    id: 'enemy-demo-4', creatureId: 'esqueleto',
                    creature: {
                      id: 'esqueleto', name: 'Esqueleto', nd: 0.5, type: 'Morto-vivo', size: 'Médio',
                      ca: 13, pv: 8, deslocamento: '9m',
                      attributes: { for: 12, des: 12, con: 10, int: 2, sab: 8, car: 6 },
                      resistances: { fortitude: 0, reflexos: 1, vontade: 2 },
                      attacks: [{ name: 'Espada curta', bonus: 3, damage: '1d6+1', type: 'corte' }],
                      abilities: ['Resistência a dano 5 (corte e perfuração)', 'Imunidade: efeitos mentais'],
                      treasure: 'Nenhum',
                    },
                    nickname: 'Esqueleto #1', currentPv: 8, addedAt: '2025-01-15T22:15:00Z',
                  },
                  {
                    id: 'enemy-demo-5', creatureId: 'esqueleto',
                    creature: {
                      id: 'esqueleto', name: 'Esqueleto', nd: 0.5, type: 'Morto-vivo', size: 'Médio',
                      ca: 13, pv: 8, deslocamento: '9m',
                      attributes: { for: 12, des: 12, con: 10, int: 2, sab: 8, car: 6 },
                      resistances: { fortitude: 0, reflexos: 1, vontade: 2 },
                      attacks: [{ name: 'Espada curta', bonus: 3, damage: '1d6+1', type: 'corte' }],
                      abilities: ['Resistência a dano 5 (corte e perfuração)', 'Imunidade: efeitos mentais'],
                      treasure: 'Nenhum',
                    },
                    nickname: 'Esqueleto #2', currentPv: 8, addedAt: '2025-01-15T22:15:01Z',
                  },
                  {
                    id: 'enemy-demo-6', creatureId: 'zumbi',
                    creature: {
                      id: 'zumbi', name: 'Zumbi', nd: 1, type: 'Morto-vivo', size: 'Médio',
                      ca: 11, pv: 16, deslocamento: '6m',
                      attributes: { for: 14, des: 6, con: 14, int: 2, sab: 8, car: 4 },
                      resistances: { fortitude: 4, reflexos: 0, vontade: 2 },
                      attacks: [{ name: 'Pancada', bonus: 4, damage: '1d6+2', type: 'contusão' }],
                      abilities: ['Resiliência Zumbi (cai com 0 PV, Fort CD 12 para ficar com 1)', 'Imunidade: efeitos mentais'],
                      treasure: 'Nenhum',
                    },
                    currentPv: 16, addedAt: '2025-01-15T22:15:02Z',
                  },
                ],
                encounterNpcs: [
                  { id: 'enc-npc-3', npcId: 'npc-demo-2', versionId: 'npc-ver-2a', currentPv: 22, notes: 'Kael aparece como aliado falso' },
                ],
                encounterObjects: [
                  { id: 'enc-obj-2', objectId: 'obj-demo-1', quantity: 1, notes: 'Escondida na árvore oca' },
                ],
                rewards: [
                  { id: 'rew-3', type: 'item', name: 'Espada de Chamas', objectId: 'obj-demo-1', quantity: 1, distributed: false },
                  { id: 'rew-4', type: 'gold', name: 'Tesouro da Clareira', value: 120, distributed: false },
                ],
                createdAt: '2025-01-15T22:05:00Z',
                updatedAt: '2025-01-15T22:20:00Z',
              },
            ],
            createdAt: '2025-01-15T18:00:00Z',
            updatedAt: '2025-01-15T22:30:00Z',
          },
          {
            id: 'sess-demo-2',
            name: 'O Covil do Necromante',
            number: 2,
            date: '2025-01-22',
            encounters: [
              {
                id: 'enc-demo-3',
                name: 'Guardiões da Cripta',
                description: 'Wights guardam a entrada da cripta do necromante',
                status: 'draft',
                enemies: [],
                encounterNpcs: [
                  { id: 'enc-npc-4', npcId: 'npc-demo-2', versionId: 'npc-ver-2b', currentPv: 52, notes: 'Kael revela sua verdadeira forma' },
                  { id: 'enc-npc-5', npcId: 'npc-demo-1', versionId: 'npc-ver-1', notes: 'Elara acompanha o grupo' },
                ],
                encounterObjects: [
                  { id: 'enc-obj-3', objectId: 'obj-demo-3', quantity: 1, notes: 'No altar do necromante' },
                ],
                rewards: [
                  { id: 'rew-5', type: 'item', name: 'Amuleto do Necromante', objectId: 'obj-demo-3', quantity: 1, distributed: false },
                  { id: 'rew-6', type: 'gold', name: 'Tesouro da Cripta', value: 500, distributed: false },
                  { id: 'rew-7', type: 'other', name: 'Gratidão da Vila', description: 'Os aldeões oferecem abrigo permanente ao grupo', distributed: false },
                ],
                createdAt: '2025-01-22T18:00:00Z',
                updatedAt: '2025-01-22T18:00:00Z',
              },
            ],
            createdAt: '2025-01-22T18:00:00Z',
            updatedAt: '2025-01-22T18:00:00Z',
          },
        ],
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-22T18:00:00Z',
      },
    ],
    npcs: [
      {
        id: 'npc-demo-1',
        name: 'Elara',
        title: 'A Curandeira',
        description: 'Sacerdotisa de Lena que viaja pela região ajudando os feridos. Conhece os caminhos da floresta.',
        alignment: 'ally',
        isCombatant: false,
        versions: [
          {
            id: 'npc-ver-1',
            label: 'Padrão',
            description: 'Elara em sua forma normal, como curandeira itinerante.',
            createdAt: '2025-01-10T10:00:00Z',
          },
        ],
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-10T10:00:00Z',
      },
      {
        id: 'npc-demo-2',
        name: 'Kael',
        title: 'O Traidor',
        description: 'Ex-soldado que agora serve o necromante. Pode parecer aliado inicialmente.',
        alignment: 'enemy',
        isCombatant: true,
        versions: [
          {
            id: 'npc-ver-2a',
            label: 'Nível Baixo',
            creature: {
              id: 'kael-weak', name: 'Kael (Fraco)', nd: 2, type: 'Humanoide', size: 'Médio',
              ca: 16, pv: 22, deslocamento: '9m',
              attributes: { for: 14, des: 12, con: 14, int: 10, sab: 10, car: 12 },
              resistances: { fortitude: 4, reflexos: 2, vontade: 3 },
              attacks: [{ name: 'Espada longa', bonus: 5, damage: '1d8+3', type: 'corte' }],
              abilities: ['Ataque Extra', 'Armadura pesada'],
              treasure: 'Padrão',
            },
            description: 'Kael quando encontrado nos primeiros confrontos.',
            createdAt: '2025-01-10T10:00:00Z',
          },
          {
            id: 'npc-ver-2b',
            label: 'Forma Corrompida',
            creature: {
              id: 'kael-strong', name: 'Kael (Corrompido)', nd: 5, type: 'Humanoide', size: 'Médio',
              ca: 19, pv: 52, deslocamento: '9m',
              attributes: { for: 18, des: 12, con: 16, int: 10, sab: 10, car: 14 },
              resistances: { fortitude: 7, reflexos: 3, vontade: 5 },
              attacks: [
                { name: 'Espada Sombria', bonus: 8, damage: '1d8+6 + 1d6 trevas', type: 'corte' },
                { name: 'Toque Necrótico', bonus: 6, damage: '2d6 trevas', type: 'trevas' },
              ],
              abilities: ['Ataque Extra', 'Aura de Medo (CD 14)', 'Resistência a dano 5 (necrótico)'],
              treasure: 'Dobro',
            },
            description: 'Kael após ser corrompido pela energia necrótica.',
            createdAt: '2025-01-15T10:00:00Z',
          },
        ],
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      },
      {
        id: 'npc-demo-3',
        name: 'Thoren',
        title: 'O Lenhador',
        description: 'Velho lenhador que mora na borda da floresta. Conhece as histórias sobre a cripta.',
        alignment: 'neutral',
        isCombatant: false,
        versions: [
          {
            id: 'npc-ver-3',
            label: 'Padrão',
            description: 'Thoren em sua cabana na floresta.',
            createdAt: '2025-01-10T10:00:00Z',
          },
        ],
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-10T10:00:00Z',
      },
    ],
    objects: [
      {
        id: 'obj-demo-1',
        name: 'Espada de Chamas',
        type: 'weapon',
        description: 'Uma espada longa encantada com fogo arcano. A lâmina brilha com chamas alaranjadas.',
        rarity: 'rare',
        value: '5000 TO',
        properties: ['+1 de ataque e dano', 'Flamejante (1d6 fogo adicional)', 'Emite luz como uma tocha'],
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-10T10:00:00Z',
      },
      {
        id: 'obj-demo-2',
        name: 'Poção de Cura',
        type: 'consumable',
        description: 'Frasco com líquido vermelho brilhante que restaura vitalidade.',
        rarity: 'common',
        value: '50 TO',
        properties: ['Cura 2d8+2 PV', 'Ação padrão para usar'],
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-10T10:00:00Z',
      },
      {
        id: 'obj-demo-3',
        name: 'Amuleto do Necromante',
        type: 'key_item',
        description: 'Um amuleto negro pulsando com energia sombria. É a fonte do poder do necromante sobre os mortos.',
        rarity: 'very_rare',
        value: '10000 TO',
        properties: ['Controla mortos-vivos em 30m', 'Causa 1d6 trevas ao portador por hora', 'Necessário para o ritual final'],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      },
    ],
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-22T18:00:00Z',
  },
]

const DEMO_FOLDERS: NoteFolder[] = [
  { id: 'folder-demo-1', name: 'Sessão 1', parentId: null, createdAt: '2025-01-15T10:00:00Z' },
  { id: 'folder-demo-2', name: 'NPCs', parentId: null, color: '#8b5cf6', createdAt: '2025-01-10T10:00:00Z' },
]

const DEMO_NOTES: Note[] = [
  {
    id: 'note-demo-1',
    title: 'Plano da Sessão 1',
    content: '<h2>Objetivos</h2><ul><li>Introduzir os jogadores à Floresta Sombria</li><li>Encontro com goblins na estrada</li><li>Descobrir a clareira corrompida</li></ul><p>Lembrar de descrever o <strong>cheiro de enxofre</strong> na clareira.</p>',
    folderId: 'folder-demo-1',
    links: [
      { type: 'session', id: 'sess-demo-1', label: 'A Taverna do Último Suspiro' },
    ],
    pinned: true,
    createdAt: '2025-01-14T18:00:00Z',
    updatedAt: '2025-01-15T20:00:00Z',
  },
  {
    id: 'note-demo-2',
    title: 'Backstory de Elara',
    content: '<p>Elara foi uma sacerdotisa no templo de Lena em Valkaria antes de partir em peregrinação. Ela esconde um segredo: seu irmão foi corrompido pelo necromante.</p><blockquote><p>\"A luz de Lena guia meus passos, mesmo nas trevas mais profundas.\"</p></blockquote>',
    folderId: 'folder-demo-2',
    links: [
      { type: 'campaign', id: 'camp-demo-1', label: 'A Maldição de Moreania' },
    ],
    pinned: false,
    createdAt: '2025-01-10T12:00:00Z',
    updatedAt: '2025-01-10T12:00:00Z',
  },
  {
    id: 'note-demo-3',
    title: 'Tesouro da Cripta',
    content: '<h3>Itens encontrados</h3><ul><li><strong>Amuleto do Necromante</strong> — no altar central</li><li>500 TO em moedas espalhadas</li></ul><p>O amuleto pulsa com energia sombria. Se alguém tocar sem proteção, sofre <em>1d6 de dano de trevas</em>.</p>',
    folderId: null,
    links: [
      { type: 'encounter', id: 'enc-demo-3', label: 'Guardiões da Cripta' },
    ],
    pinned: false,
    createdAt: '2025-01-22T19:00:00Z',
    updatedAt: '2025-01-22T19:30:00Z',
  },
]

export const initialState: MesaState = {
  mesa: null,
  snapshotFields: [],
  campaigns: DEMO_CAMPAIGNS,
  activeCampaignId: null,
  activeAdventureId: null,
  activeSessionId: null,
  activeEncounterId: null,
  combatState: null,
  notes: DEMO_NOTES,
  noteFolders: DEMO_FOLDERS,
  activeNoteId: null,
  activeFolderId: null,
  soundboard: {
    slots: DEFAULT_SOUNDBOARD_SLOTS,
    customSounds: [],
    recentMedia: [],
    playlistSlots: DEFAULT_PLAYLIST_SLOTS,
    customPlaylists: [],
  },
  isLoading: false,
  error: null,
}

// ---- Helpers para navegar a hierarquia ----

function getActiveCampaign(state: MesaState): Campaign | undefined {
  return state.campaigns.find(c => c.id === state.activeCampaignId)
}

function getActiveAdventure(state: MesaState): Adventure | undefined {
  return getActiveCampaign(state)?.adventures.find(a => a.id === state.activeAdventureId)
}

function getActiveSession(state: MesaState): Session | undefined {
  return getActiveAdventure(state)?.sessions.find(s => s.id === state.activeSessionId)
}

export function getActiveEncounter(state: MesaState): Encounter | undefined {
  return getActiveSession(state)?.encounters.find(e => e.id === state.activeEncounterId)
}

// Atualiza um encontro específico na hierarquia
function updateActiveEncounter(state: MesaState, updater: (enc: Encounter) => Encounter): MesaState {
  const { activeCampaignId, activeAdventureId, activeSessionId, activeEncounterId } = state
  if (!activeCampaignId || !activeAdventureId || !activeSessionId || !activeEncounterId) return state

  return {
    ...state,
    campaigns: state.campaigns.map(c =>
      c.id !== activeCampaignId ? c : {
        ...c,
        adventures: c.adventures.map(a =>
          a.id !== activeAdventureId ? a : {
            ...a,
            sessions: a.sessions.map(s =>
              s.id !== activeSessionId ? s : {
                ...s,
                encounters: s.encounters.map(e =>
                  e.id !== activeEncounterId ? e : updater(e)
                ),
              }
            ),
          }
        ),
      }
    ),
  }
}

// Atualiza sessão ativa (para adicionar/remover encontros)
function updateActiveSession(state: MesaState, updater: (s: Session) => Session): MesaState {
  const { activeCampaignId, activeAdventureId, activeSessionId } = state
  if (!activeCampaignId || !activeAdventureId || !activeSessionId) return state

  return {
    ...state,
    campaigns: state.campaigns.map(c =>
      c.id !== activeCampaignId ? c : {
        ...c,
        adventures: c.adventures.map(a =>
          a.id !== activeAdventureId ? a : {
            ...a,
            sessions: a.sessions.map(s =>
              s.id !== activeSessionId ? s : updater(s)
            ),
          }
        ),
      }
    ),
  }
}

// Atualiza aventura ativa
function updateActiveAdventure(state: MesaState, updater: (a: Adventure) => Adventure): MesaState {
  const { activeCampaignId, activeAdventureId } = state
  if (!activeCampaignId || !activeAdventureId) return state

  return {
    ...state,
    campaigns: state.campaigns.map(c =>
      c.id !== activeCampaignId ? c : {
        ...c,
        adventures: c.adventures.map(a =>
          a.id !== activeAdventureId ? a : updater(a)
        ),
      }
    ),
  }
}

// Atualiza campanha ativa
function updateActiveCampaign(state: MesaState, updater: (c: Campaign) => Campaign): MesaState {
  const { activeCampaignId } = state
  if (!activeCampaignId) return state

  return {
    ...state,
    campaigns: state.campaigns.map(c =>
      c.id !== activeCampaignId ? c : updater(c)
    ),
  }
}

// ---- Helpers de combate ----

export function buildInitiativeOrder(
  encounter: Encounter,
  characters: Character[],
  campaign: Campaign | undefined,
): InitiativeEntry[] {
  const entries: InitiativeEntry[] = []

  // Inimigos: auto-roll d20 + mod DES
  for (const enemy of encounter.enemies) {
    const desMod = Math.floor((enemy.creature.attributes.des - 10) / 2)
    const roll = Math.floor(Math.random() * 20) + 1 + desMod
    entries.push({
      id: `combat-enemy-${enemy.id}`,
      name: enemy.nickname || enemy.creature.name,
      type: 'enemy',
      initiative: roll,
      sourceId: enemy.id,
      currentPv: enemy.currentPv,
      maxPv: enemy.creature.pv,
      ca: enemy.creature.ca,
      isDefeated: enemy.currentPv <= 0,
    })
  }

  // Jogadores: initiative pendente
  for (const char of characters) {
    entries.push({
      id: `combat-player-${char.id}`,
      name: char.name,
      type: 'player',
      initiative: null,
      sourceId: char.id,
      currentPv: char.health,
      maxPv: char.maxHealth,
      ca: char.defenses?.find(d => d.name === 'CA')?.value,
      isDefeated: false,
    })
  }

  // NPCs combatentes do encontro
  for (const encNpc of encounter.encounterNpcs) {
    const npc = campaign?.npcs?.find(n => n.id === encNpc.npcId)
    if (!npc) continue
    const version = npc.versions.find(v => v.id === encNpc.versionId)
    if (!version?.creature) continue
    const desMod = Math.floor((version.creature.attributes.des - 10) / 2)
    const roll = Math.floor(Math.random() * 20) + 1 + desMod
    entries.push({
      id: `combat-npc-${encNpc.id}`,
      name: npc.name,
      type: 'npc',
      initiative: roll,
      sourceId: encNpc.id,
      currentPv: encNpc.currentPv ?? version.creature.pv,
      maxPv: version.creature.pv,
      ca: version.creature.ca,
      isDefeated: false,
    })
  }

  return entries
}

function sortInitiativeOrder(entries: InitiativeEntry[]): InitiativeEntry[] {
  return [...entries].sort((a, b) => {
    const aInit = a.initiative ?? -999
    const bInit = b.initiative ?? -999
    if (bInit !== aInit) return bInit - aInit
    // Empate: player > npc > enemy
    const typePriority = { player: 0, npc: 1, enemy: 2 }
    return typePriority[a.type] - typePriority[b.type]
  })
}

function findNextAliveIndex(entries: InitiativeEntry[], fromIndex: number, direction: 1 | -1): { index: number; newRound: boolean } {
  const len = entries.length
  if (len === 0) return { index: 0, newRound: false }

  let idx = fromIndex
  let wrapped = false
  for (let i = 0; i < len; i++) {
    idx += direction
    if (idx >= len) { idx = 0; wrapped = true }
    if (idx < 0) { idx = len - 1; wrapped = true }
    if (!entries[idx].isDefeated) return { index: idx, newRound: wrapped && direction === 1 }
  }
  return { index: fromIndex, newRound: false }
}

export function mesaReducer(state: MesaState, action: MesaAction): MesaState {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SET_MESA':
      return { ...state, mesa: action.payload, isLoading: false, error: null }

    case 'CLEAR_MESA':
      return { ...state, mesa: null }

    case 'UPDATE_CHARACTER':
      if (!state.mesa) return state
      return {
        ...state,
        mesa: {
          ...state.mesa,
          characters: state.mesa.characters.map(char =>
            char.id === action.payload.characterId
              ? { ...char, ...action.payload.data }
              : char
          ),
        },
      }

    case 'SET_SNAPSHOT_FIELDS':
      return { ...state, snapshotFields: action.payload }

    case 'TOGGLE_FIELD_VISIBILITY':
      return {
        ...state,
        snapshotFields: state.snapshotFields.map(field =>
          field.id === action.payload ? { ...field, visible: !field.visible } : field
        ),
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    // ---- Campaigns ----
    case 'CREATE_CAMPAIGN': {
      const campaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        adventures: [],
        npcs: [],
        objects: [],
        createdAt: now,
        updatedAt: now,
      }
      return {
        ...state,
        campaigns: [...state.campaigns, campaign],
        activeCampaignId: campaign.id,
      }
    }

    case 'DELETE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.filter(c => c.id !== action.payload),
        activeCampaignId: state.activeCampaignId === action.payload ? null : state.activeCampaignId,
        activeAdventureId: state.activeCampaignId === action.payload ? null : state.activeAdventureId,
        activeSessionId: state.activeCampaignId === action.payload ? null : state.activeSessionId,
        activeEncounterId: state.activeCampaignId === action.payload ? null : state.activeEncounterId,
      }

    case 'SET_ACTIVE_CAMPAIGN':
      return {
        ...state,
        activeCampaignId: action.payload,
        activeAdventureId: null,
        activeSessionId: null,
        activeEncounterId: null,
      }

    // ---- Adventures ----
    case 'CREATE_ADVENTURE': {
      const adventure: Adventure = {
        id: `adv-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        drawnCards: [],
        sessions: [],
        createdAt: now,
        updatedAt: now,
      }
      return {
        ...updateActiveCampaign(state, c => ({
          ...c,
          adventures: [...c.adventures, adventure],
          updatedAt: now,
        })),
        activeAdventureId: adventure.id,
      }
    }

    case 'DELETE_ADVENTURE':
      return {
        ...updateActiveCampaign(state, c => ({
          ...c,
          adventures: c.adventures.filter(a => a.id !== action.payload),
          updatedAt: now,
        })),
        activeAdventureId: state.activeAdventureId === action.payload ? null : state.activeAdventureId,
        activeSessionId: state.activeAdventureId === action.payload ? null : state.activeSessionId,
        activeEncounterId: state.activeAdventureId === action.payload ? null : state.activeEncounterId,
      }

    case 'SET_ACTIVE_ADVENTURE':
      return {
        ...state,
        activeAdventureId: action.payload,
        activeSessionId: null,
        activeEncounterId: null,
      }

    // ---- Sessions ----
    case 'CREATE_SESSION': {
      const session: Session = {
        id: `sess-${Date.now()}`,
        name: action.payload.name,
        number: action.payload.number,
        date: action.payload.date,
        encounters: [],
        createdAt: now,
        updatedAt: now,
      }
      return {
        ...updateActiveAdventure(state, a => ({
          ...a,
          sessions: [...a.sessions, session],
          updatedAt: now,
        })),
        activeSessionId: session.id,
      }
    }

    case 'DELETE_SESSION':
      return {
        ...updateActiveAdventure(state, a => ({
          ...a,
          sessions: a.sessions.filter(s => s.id !== action.payload),
          updatedAt: now,
        })),
        activeSessionId: state.activeSessionId === action.payload ? null : state.activeSessionId,
        activeEncounterId: state.activeSessionId === action.payload ? null : state.activeEncounterId,
      }

    case 'SET_ACTIVE_SESSION':
      return {
        ...state,
        activeSessionId: action.payload,
        activeEncounterId: null,
      }

    // ---- Encounters ----
    case 'CREATE_ENCOUNTER': {
      const encounter: Encounter = {
        id: `enc-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        status: 'draft',
        enemies: [],
        encounterNpcs: [],
        encounterObjects: [],
        rewards: [],
        createdAt: now,
        updatedAt: now,
      }
      return {
        ...updateActiveSession(state, s => ({
          ...s,
          encounters: [...s.encounters, encounter],
          updatedAt: now,
        })),
        activeEncounterId: encounter.id,
      }
    }

    case 'DELETE_ENCOUNTER':
      return {
        ...updateActiveSession(state, s => ({
          ...s,
          encounters: s.encounters.filter(e => e.id !== action.payload),
          updatedAt: now,
        })),
        activeEncounterId: state.activeEncounterId === action.payload ? null : state.activeEncounterId,
      }

    case 'SET_ACTIVE_ENCOUNTER':
      return { ...state, activeEncounterId: action.payload }

    case 'UPDATE_ENCOUNTER':
      return updateActiveEncounter(state, e =>
        e.id === action.payload.id
          ? { ...e, ...action.payload.data, updatedAt: now }
          : e
      )

    case 'ADD_CARD_TO_ADVENTURE':
      return updateActiveAdventure(state, a => ({
        ...a,
        drawnCards: [...(a.drawnCards ?? []), action.payload.card],
        updatedAt: now,
      }))

    case 'REMOVE_CARD_FROM_ADVENTURE':
      return updateActiveAdventure(state, a => ({
        ...a,
        drawnCards: (a.drawnCards ?? []).filter((_, i) => i !== action.payload.cardIndex),
        updatedAt: now,
      }))

    case 'CLEAR_ADVENTURE_CARDS':
      return updateActiveAdventure(state, a => ({
        ...a,
        drawnCards: [],
        updatedAt: now,
      }))

    // ---- Enemies ----
    case 'ADD_ENEMY_TO_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        enemies: [...(e.enemies ?? []), action.payload.enemy],
        updatedAt: now,
      }))

    case 'REMOVE_ENEMY_FROM_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        enemies: (e.enemies ?? []).filter(en => en.id !== action.payload.enemyId),
        updatedAt: now,
      }))

    case 'UPDATE_ENEMY_IN_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        enemies: (e.enemies ?? []).map(en =>
          en.id !== action.payload.enemyId ? en : { ...en, ...action.payload.updates }
        ),
        updatedAt: now,
      }))

    // ---- Campaign NPCs ----
    case 'CREATE_NPC':
      return updateActiveCampaign(state, c => ({
        ...c,
        npcs: [...(c.npcs ?? []), action.payload.npc],
        updatedAt: now,
      }))

    case 'UPDATE_NPC':
      return updateActiveCampaign(state, c => ({
        ...c,
        npcs: (c.npcs ?? []).map(n =>
          n.id !== action.payload.npcId ? n : { ...n, ...action.payload.updates, updatedAt: now }
        ),
        updatedAt: now,
      }))

    case 'DELETE_NPC':
      return updateActiveCampaign(state, c => ({
        ...c,
        npcs: (c.npcs ?? []).filter(n => n.id !== action.payload.npcId),
        updatedAt: now,
      }))

    case 'ADD_NPC_VERSION':
      return updateActiveCampaign(state, c => ({
        ...c,
        npcs: (c.npcs ?? []).map(n =>
          n.id !== action.payload.npcId ? n : {
            ...n,
            versions: [...n.versions, action.payload.version],
            updatedAt: now,
          }
        ),
        updatedAt: now,
      }))

    case 'UPDATE_NPC_VERSION':
      return updateActiveCampaign(state, c => ({
        ...c,
        npcs: (c.npcs ?? []).map(n =>
          n.id !== action.payload.npcId ? n : {
            ...n,
            versions: n.versions.map(v =>
              v.id !== action.payload.versionId ? v : { ...v, ...action.payload.updates }
            ),
            updatedAt: now,
          }
        ),
        updatedAt: now,
      }))

    case 'DELETE_NPC_VERSION':
      return updateActiveCampaign(state, c => ({
        ...c,
        npcs: (c.npcs ?? []).map(n =>
          n.id !== action.payload.npcId ? n : {
            ...n,
            versions: n.versions.filter(v => v.id !== action.payload.versionId),
            updatedAt: now,
          }
        ),
        updatedAt: now,
      }))

    // ---- Encounter NPCs ----
    case 'ADD_NPC_TO_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        encounterNpcs: [...(e.encounterNpcs ?? []), action.payload.encounterNpc],
        updatedAt: now,
      }))

    case 'REMOVE_NPC_FROM_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        encounterNpcs: (e.encounterNpcs ?? []).filter(n => n.id !== action.payload.encounterNpcId),
        updatedAt: now,
      }))

    case 'UPDATE_NPC_IN_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        encounterNpcs: (e.encounterNpcs ?? []).map(n =>
          n.id !== action.payload.encounterNpcId ? n : { ...n, ...action.payload.updates }
        ),
        updatedAt: now,
      }))

    // ---- Campaign Objects ----
    case 'CREATE_OBJECT':
      return updateActiveCampaign(state, c => ({
        ...c,
        objects: [...(c.objects ?? []), action.payload.object],
        updatedAt: now,
      }))

    case 'UPDATE_OBJECT':
      return updateActiveCampaign(state, c => ({
        ...c,
        objects: (c.objects ?? []).map(o =>
          o.id !== action.payload.objectId ? o : { ...o, ...action.payload.updates, updatedAt: now }
        ),
        updatedAt: now,
      }))

    case 'DELETE_OBJECT':
      return updateActiveCampaign(state, c => ({
        ...c,
        objects: (c.objects ?? []).filter(o => o.id !== action.payload.objectId),
        updatedAt: now,
      }))

    // ---- Encounter Objects ----
    case 'ADD_OBJECT_TO_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        encounterObjects: [...(e.encounterObjects ?? []), action.payload.encounterObject],
        updatedAt: now,
      }))

    case 'REMOVE_OBJECT_FROM_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        encounterObjects: (e.encounterObjects ?? []).filter(o => o.id !== action.payload.encounterObjectId),
        updatedAt: now,
      }))

    case 'UPDATE_OBJECT_IN_ENCOUNTER':
      return updateActiveEncounter(state, e => ({
        ...e,
        encounterObjects: (e.encounterObjects ?? []).map(o =>
          o.id !== action.payload.encounterObjectId ? o : { ...o, ...action.payload.updates }
        ),
        updatedAt: now,
      }))

    // ---- Rewards ----
    case 'ADD_REWARD':
      return updateActiveEncounter(state, e => ({
        ...e,
        rewards: [...(e.rewards ?? []), action.payload.reward],
        updatedAt: now,
      }))

    case 'UPDATE_REWARD':
      return updateActiveEncounter(state, e => ({
        ...e,
        rewards: (e.rewards ?? []).map(r =>
          r.id !== action.payload.rewardId ? r : { ...r, ...action.payload.updates }
        ),
        updatedAt: now,
      }))

    case 'REMOVE_REWARD':
      return updateActiveEncounter(state, e => ({
        ...e,
        rewards: (e.rewards ?? []).filter(r => r.id !== action.payload.rewardId),
        updatedAt: now,
      }))

    case 'TOGGLE_REWARD_DISTRIBUTED':
      return updateActiveEncounter(state, e => ({
        ...e,
        rewards: (e.rewards ?? []).map(r =>
          r.id !== action.payload.rewardId ? r : { ...r, distributed: !r.distributed }
        ),
        updatedAt: now,
      }))

    // ---- Navigation ----
    case 'NAVIGATE_BACK':
      if (state.activeEncounterId) return { ...state, activeEncounterId: null }
      if (state.activeSessionId) return { ...state, activeSessionId: null }
      if (state.activeAdventureId) return { ...state, activeAdventureId: null }
      if (state.activeCampaignId) return { ...state, activeCampaignId: null }
      return state

    case 'NAVIGATE_TO_ENCOUNTER':
      return {
        ...state,
        activeAdventureId: action.payload.adventureId,
        activeSessionId: action.payload.sessionId,
        activeEncounterId: action.payload.encounterId,
      }

    // ---- Notes ----
    case 'CREATE_NOTE':
      return { ...state, notes: [...state.notes, action.payload.note], activeNoteId: action.payload.note.id }

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id !== action.payload.noteId ? n : { ...n, ...action.payload.updates, updatedAt: now }
        ),
      }

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload.noteId),
        activeNoteId: state.activeNoteId === action.payload.noteId ? null : state.activeNoteId,
      }

    case 'SET_ACTIVE_NOTE':
      return { ...state, activeNoteId: action.payload.noteId }

    case 'TOGGLE_NOTE_PIN':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id !== action.payload.noteId ? n : { ...n, pinned: !n.pinned, updatedAt: now }
        ),
      }

    case 'MOVE_NOTE_TO_FOLDER':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id !== action.payload.noteId ? n : { ...n, folderId: action.payload.folderId, updatedAt: now }
        ),
      }

    case 'ADD_NOTE_LINK':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id !== action.payload.noteId ? n : {
            ...n,
            links: [...n.links, action.payload.link],
            updatedAt: now,
          }
        ),
      }

    case 'REMOVE_NOTE_LINK':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id !== action.payload.noteId ? n : {
            ...n,
            links: n.links.filter(l => !(l.type === action.payload.linkType && l.id === action.payload.linkId)),
            updatedAt: now,
          }
        ),
      }

    // ---- Note Folders ----
    case 'CREATE_NOTE_FOLDER':
      return { ...state, noteFolders: [...state.noteFolders, action.payload.folder] }

    case 'RENAME_NOTE_FOLDER':
      return {
        ...state,
        noteFolders: state.noteFolders.map(f =>
          f.id !== action.payload.folderId ? f : { ...f, name: action.payload.name }
        ),
      }

    case 'DELETE_NOTE_FOLDER': {
      // Collect all descendant folder IDs recursively
      const idsToDelete = new Set<string>()
      function collectChildren(parentId: string) {
        idsToDelete.add(parentId)
        for (const f of state.noteFolders) {
          if (f.parentId === parentId) collectChildren(f.id)
        }
      }
      collectChildren(action.payload.folderId)

      return {
        ...state,
        noteFolders: state.noteFolders.filter(f => !idsToDelete.has(f.id)),
        notes: state.notes.map(n =>
          n.folderId && idsToDelete.has(n.folderId) ? { ...n, folderId: null } : n
        ),
        activeFolderId: state.activeFolderId && idsToDelete.has(state.activeFolderId) ? null : state.activeFolderId,
      }
    }

    case 'SET_ACTIVE_FOLDER':
      return { ...state, activeFolderId: action.payload.folderId }

    // ── Soundboard ──

    case 'ADD_SOUNDBOARD_SLOT':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          slots: [...state.soundboard.slots, action.payload.slot],
        },
      }

    case 'REMOVE_SOUNDBOARD_SLOT':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          slots: state.soundboard.slots.filter(s => s.id !== action.payload.slotId),
        },
      }

    case 'REORDER_SOUNDBOARD_SLOTS':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          slots: action.payload.slots,
        },
      }

    case 'UPDATE_SOUNDBOARD_SLOT':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          slots: state.soundboard.slots.map(s =>
            s.id !== action.payload.slotId ? s : { ...s, ...action.payload.updates }
          ),
        },
      }

    case 'ADD_CUSTOM_SOUND':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          customSounds: [...state.soundboard.customSounds, action.payload.sound],
        },
      }

    case 'REMOVE_CUSTOM_SOUND':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          customSounds: state.soundboard.customSounds.filter(s => s.id !== action.payload.soundId),
          slots: state.soundboard.slots.filter(s => !(s.isCustom && s.soundId === action.payload.soundId)),
        },
      }

    case 'ADD_RECENT_MEDIA': {
      const filtered = state.soundboard.recentMedia.filter(m => m.url !== action.payload.media.url)
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          recentMedia: [action.payload.media, ...filtered].slice(0, 5),
        },
      }
    }

    // ── Playlists ──

    case 'ADD_PLAYLIST_SLOT':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          playlistSlots: [...state.soundboard.playlistSlots, action.payload.slot],
        },
      }

    case 'REMOVE_PLAYLIST_SLOT':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          playlistSlots: state.soundboard.playlistSlots.filter(s => s.id !== action.payload.slotId),
        },
      }

    case 'ADD_CUSTOM_PLAYLIST':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          customPlaylists: [...state.soundboard.customPlaylists, action.payload.playlist],
        },
      }

    case 'REMOVE_CUSTOM_PLAYLIST':
      return {
        ...state,
        soundboard: {
          ...state.soundboard,
          customPlaylists: state.soundboard.customPlaylists.filter(p => p.id !== action.payload.playlistId),
          playlistSlots: state.soundboard.playlistSlots.filter(s => !(s.isCustom && s.playlistId === action.payload.playlistId)),
        },
      }

    // ── Combat ──

    case 'START_COMBAT':
      return {
        ...state,
        combatState: {
          encounterId: action.payload.encounterId,
          status: 'rolling_initiative',
          round: 1,
          currentTurnIndex: 0,
          initiativeOrder: action.payload.initiativeOrder,
        },
      }

    case 'END_COMBAT':
      return { ...state, combatState: null }

    case 'RESTORE_COMBAT': {
      const payload = action.payload
      // When transitioning to in_progress, ensure the first entry has actions set
      if (payload.status === 'in_progress' && payload.initiativeOrder.length > 0) {
        const first = payload.initiativeOrder[payload.currentTurnIndex]
        if (first && !first.availableActions) {
          return {
            ...state,
            combatState: {
              ...payload,
              initiativeOrder: payload.initiativeOrder.map((e, i) =>
                i === payload.currentTurnIndex
                  ? { ...e, availableActions: { standard: 1, movement: 1, free: 3 } }
                  : e
              ),
            },
          }
        }
      }
      return { ...state, combatState: payload }
    }

    case 'SET_INITIATIVE': {
      if (!state.combatState) return state
      const updated = state.combatState.initiativeOrder.map(e =>
        e.id === action.payload.entryId ? { ...e, initiative: action.payload.initiative } : e
      )
      const allSet = updated.every(e => e.initiative !== null)
      const sorted = allSet ? sortInitiativeOrder(updated) : updated
      return {
        ...state,
        combatState: {
          ...state.combatState,
          initiativeOrder: sorted,
          status: allSet ? 'in_progress' : state.combatState.status,
          currentTurnIndex: 0,
        },
      }
    }

    case 'NEXT_TURN': {
      if (!state.combatState || state.combatState.status !== 'in_progress') return state
      const { index, newRound } = findNextAliveIndex(
        state.combatState.initiativeOrder,
        state.combatState.currentTurnIndex,
        1,
      )
      return {
        ...state,
        combatState: {
          ...state.combatState,
          currentTurnIndex: index,
          round: newRound ? state.combatState.round + 1 : state.combatState.round,
          initiativeOrder: state.combatState.initiativeOrder.map((e, i) =>
            i === index ? { ...e, availableActions: { standard: 1, movement: 1, free: 3 } } : e
          ),
        },
      }
    }

    case 'PREVIOUS_TURN': {
      if (!state.combatState || state.combatState.status !== 'in_progress') return state
      const { index, newRound } = findNextAliveIndex(
        state.combatState.initiativeOrder,
        state.combatState.currentTurnIndex,
        -1,
      )
      return {
        ...state,
        combatState: {
          ...state.combatState,
          currentTurnIndex: index,
          round: newRound ? Math.max(1, state.combatState.round - 1) : state.combatState.round,
        },
      }
    }

    case 'UPDATE_COMBAT_ENTRY': {
      if (!state.combatState) return state
      return {
        ...state,
        combatState: {
          ...state.combatState,
          initiativeOrder: state.combatState.initiativeOrder.map(e =>
            e.id === action.payload.entryId ? { ...e, ...action.payload.updates } : e
          ),
        },
      }
    }

    case 'ADD_COMBAT_ENTRY': {
      if (!state.combatState) return state
      return {
        ...state,
        combatState: {
          ...state.combatState,
          initiativeOrder: sortInitiativeOrder([
            ...state.combatState.initiativeOrder,
            action.payload.entry,
          ]),
        },
      }
    }

    case 'REMOVE_COMBAT_ENTRY': {
      if (!state.combatState) return state
      const filtered = state.combatState.initiativeOrder.filter(e => e.id !== action.payload.entryId)
      return {
        ...state,
        combatState: {
          ...state.combatState,
          initiativeOrder: filtered,
          currentTurnIndex: Math.min(state.combatState.currentTurnIndex, Math.max(0, filtered.length - 1)),
        },
      }
    }

    default:
      return state
  }
}
