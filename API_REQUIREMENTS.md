# API Requirements — Arkheion

Documento de contrato entre cliente (Remix + Apollo) e servidor GraphQL.
Gerado em 2026-02-22 com base nos tipos TypeScript existentes do projeto.

---

## Índice

1. [Estratégia geral](#estratégia-geral)
2. [Auth](#auth)
3. [Usuários](#usuários)
4. [Mesas](#mesas)
5. [Personagens](#personagens)
6. [Campanhas e Hierarquia de Encontros](#campanhas-e-hierarquia-de-encontros)
7. [Criaturas (banco de dados do sistema)](#criaturas-banco-de-dados-do-sistema)
8. [NPCs de Campanha](#npcs-de-campanha)
9. [Objetos de Campanha](#objetos-de-campanha)
10. [Recompensas](#recompensas)
11. [Cartas de Aventura](#cartas-de-aventura)
12. [Notas](#notas)
13. [Soundboard](#soundboard)
14. [Combate em Tempo Real (Socket.io)](#combate-em-tempo-real-socketio)
15. [Upload de Arquivos](#upload-de-arquivos)
16. [Erros e Paginação](#erros-e-paginação)

---

## Estratégia geral

| Tecnologia | Uso |
|------------|-----|
| **GraphQL** | Todas as queries e mutations de dados |
| **Apollo Client** | Cache client-side, optimistic responses |
| **Socket.io** | Estado de combate em tempo real (não GraphQL) |
| **REST (multipart)** | Upload de imagens (personagem, mesa) |
| **JWT** | Autenticação (cookie HttpOnly) |

**Estado que NÃO precisa de API:**
- `SoundboardConfig` — persiste em `localStorage` via `redux-persist` (por usuário/dispositivo)
- `snapshotFields` — preferências de UI, `localStorage`
- `CombatState` — real-time via Socket.io + `sessionStorage`

---

## Auth

```graphql
# ─── Mutations ───────────────────────────────────────────────────────────────

# Cria conta nova e retorna sessão
mutation Signup(email: String!, password: String!, name: String!): AuthPayload!

# Autentica e retorna sessão
mutation Login(email: String!, password: String!): AuthPayload!

# Invalida token no servidor (cookie é limpo pelo cliente)
mutation Logout: Boolean!

# Solicita e-mail de recuperação de senha
mutation RequestPasswordReset(email: String!): Boolean!

# Redefine senha com token recebido por e-mail
mutation ResetPassword(token: String!, newPassword: String!): AuthPayload!

# ─── Types ───────────────────────────────────────────────────────────────────

type AuthPayload {
  token: String!      # JWT — também enviado como cookie HttpOnly
  user:  User!
}
```

---

## Usuários

```graphql
# ─── Queries ─────────────────────────────────────────────────────────────────

# Usuário autenticado atual
query Me: User!

# ─── Mutations ───────────────────────────────────────────────────────────────

mutation UpdateProfile(input: UpdateProfileInput!): User!
mutation ChangePassword(currentPassword: String!, newPassword: String!): Boolean!
mutation DeleteAccount(password: String!): Boolean!

# ─── Types ───────────────────────────────────────────────────────────────────

type User {
  id:        ID!
  email:     String!
  name:      String!
  avatarUrl: String
  createdAt: String!
  updatedAt: String!
}

input UpdateProfileInput {
  name:      String
  avatarUrl: String
}
```

---

## Mesas

```graphql
# ─── Queries ─────────────────────────────────────────────────────────────────

# Lista todas as mesas do usuário autenticado (como DM ou jogador)
query GetMesas: [MesaSummary!]!

# Carrega mesa completa (com personagens populados) para o dashboard do DM
query GetMesa(id: ID!): MesaWithCharacters!

# ─── Mutations ───────────────────────────────────────────────────────────────

mutation CreateMesa(input: CreateMesaInput!): Mesa!
mutation UpdateMesa(id: ID!, input: UpdateMesaInput!): Mesa!
mutation DeleteMesa(id: ID!): Boolean!

# Vincula um personagem existente à mesa
mutation AddCharacterToMesa(mesaId: ID!, characterId: ID!): Mesa!

# Remove personagem da mesa (não deleta o personagem)
mutation RemoveCharacterFromMesa(mesaId: ID!, characterId: ID!): Mesa!

# ─── Types ───────────────────────────────────────────────────────────────────

type Mesa {
  id:          ID!
  name:        String!
  description: String
  imageUrl:    String
  dmId:        ID!
  characterIds: [ID!]!
  createdAt:   String!
  updatedAt:   String!
}

type MesaWithCharacters {
  id:          ID!
  name:        String!
  description: String
  imageUrl:    String
  dmId:        ID!
  characters:  [Character!]!
  createdAt:   String!
  updatedAt:   String!
}

type MesaSummary {
  id:             ID!
  name:           String!
  imageUrl:       String
  characterCount: Int!
  updatedAt:      String!
}

input CreateMesaInput {
  name:        String!
  description: String
  imageUrl:    String
}

input UpdateMesaInput {
  name:        String
  description: String
  imageUrl:    String
}
```

---

## Personagens

O tipo `Character` é extenso. O servidor deve suportar atualização granular por campo para otimistic updates eficientes. Campos de combate transitório (`inCombat`, `isMyTurn`, `initiativeRoll`, `availableActions`) podem ser gerenciados client-side durante o combate e sincronizados ao final.

```graphql
# ─── Queries ─────────────────────────────────────────────────────────────────

# Todos os personagens do usuário autenticado
query GetCharacters: [CharacterSummary!]!

# Personagem completo (para a ficha de personagem)
query GetCharacter(id: ID!): Character!

# ─── Mutations ───────────────────────────────────────────────────────────────

# Criação via wizard
mutation CreateCharacter(input: CreateCharacterInput!): Character!

# Deleção
mutation DeleteCharacter(id: ID!): Boolean!

# Atualizações granulares (cada uma é um optimistic update independente)
mutation UpdateCharacterHealth(id: ID!, health: Int!): Character!
mutation UpdateCharacterMana(id: ID!, mana: Int!): Character!
mutation UpdateCharacterAttributes(id: ID!, attributes: [AttributeInput!]!): Character!
mutation UpdateCharacterResistances(id: ID!, resistances: [ResistanceInput!]!): Character!
mutation UpdateCharacterDefenses(id: ID!, defenses: [DefenseInput!]!): Character!
mutation UpdateCharacterSkills(id: ID!, skills: [SkillInput!]!): Character!
mutation UpdateCharacterAbilities(id: ID!, abilities: [AbilityInput!]!): Character!
mutation UpdateCharacterSpells(id: ID!, spells: [SpellInput!]!): Character!
mutation UpdateCharacterWeapons(id: ID!, weapons: [WeaponAttackInput!]!): Character!
mutation UpdateCharacterActionsList(id: ID!, actionsList: [CombatActionInput!]!): Character!
mutation UpdateCharacterEquipment(
  id: ID!
  equippedItems: EquippedItemsInput!
  backpack: [EquipmentItemInput]!
): Character!
mutation UpdateCharacterCurrencies(id: ID!, currencies: CurrenciesInput!): Character!
mutation UpdateCharacterAvailableActions(id: ID!, availableActions: AvailableActionsInput!): Character!
mutation UpdateCharacterInitiativeRoll(id: ID!, initiativeRoll: Int): Character!

# Level up com dados estruturados
mutation LevelUpCharacter(id: ID!, input: LevelUpInput!): Character!

# ─── Types ───────────────────────────────────────────────────────────────────

type Character {
  id:          ID!
  name:        String!
  imageUrl:    String
  classes:     [CharacterClass!]!
  origin:      CharacterInfo
  deity:       CharacterInfo

  # Resources
  health:    Int!
  maxHealth: Int!
  mana:      Int!
  maxMana:   Int!

  # Attributes
  attributes:  [Attribute!]!
  resistances: [Resistance!]!
  defenses:    [Defense!]!

  # Combat (transient — gerenciado client-side durante combate)
  inCombat:         Boolean
  initiativeRoll:   Int
  isMyTurn:         Boolean!
  turnOrder:        Int!
  availableActions: AvailableActions!
  actionsList:      [CombatAction!]!
  weapons:          [WeaponAttack!]!

  # Skills & Abilities
  skills:    [Skill!]!
  abilities: [Ability!]
  spells:    [Spell!]

  # Equipment
  equippedItems: EquippedItems!
  backpack:      [EquipmentItem]!
  currencies:    Currencies!

  # Metadata
  updatedAt: String!
  version:   Int!
}

type CharacterSummary {
  id:      ID!
  name:    String!
  imageUrl: String
  classes: [CharacterClass!]!
  level:   Int!
}

# Sub-types
type CharacterClass { name: String!; level: Int!; tooltip: String }
type CharacterInfo  { name: String!; tooltip: String }

type Attribute  { label: String!; value: Int!; modifier: Int!; visible: Boolean! }
type Resistance { name: String!; value: Int!; tooltip: String!; visible: Boolean! }
type Defense    { name: String!; value: Int!; tooltip: String! }

type Skill {
  name:            String!
  modifier:        Int!
  trained:         Boolean!
  attribute:       String!
  tooltip:         String
  visibleInCombat: Boolean
  visibleInSummary: Boolean
  levelBonus:      Int
  trainingBonus:   Int
  otherBonuses:    [BonusEntry!]
}
type BonusEntry { label: String!; value: Int! }

type AvailableActions {
  standard: Int!
  movement: Int!
  free:     Int!
  full:     Int!
  reaction: Int!
}

type CombatAction {
  id:           ID!
  name:         String!
  type:         String!  # 'standard' | 'movement' | 'free' | 'full' | 'reaction' | 'other'
  cost:         ActionCost
  effect:       String!
  tooltip:      String
  modal:        Boolean
  choices:      [String!]
  isFavorite:   Boolean
  favoriteOrder: Int
  usesPerTurn:  Int
  usedThisTurn: Int
  resistance:   String
}
type ActionCost { pm: Int; pv: Int }

type WeaponAttack {
  id:              ID!
  name:            String!
  damage:          String!
  damageType:      String
  attackBonus:     Int!
  attackAttribute: String
  critRange:       String
  critMultiplier:  String
  range:           String
  actionType:      String!  # 'standard' | 'full'
  isFavorite:      Boolean
  favoriteOrder:   Int
  equipmentId:     ID
}

type Ability {
  id:           ID!
  name:         String!
  description:  String!
  type:         String!  # 'active' | 'passive'
  actionType:   String   # 'standard' | 'movement' | 'free' | 'full' | 'reaction'
  cost:         ActionCost
  usesPerDay:   Int
  source:       String
  isFavorite:   Boolean
  favoriteOrder: Int
}

type Spell {
  id:               ID!
  name:             String!
  type:             String!  # 'arcana' | 'divina'
  circle:           Int!
  school:           String!
  execution:        String!
  executionDetails: String
  range:            String!
  target:           SpellTarget
  areaEffect:       String
  areaEffectDetails: String
  counterspell:     String
  duration:         String!
  durationDetails:  String
  resistance:       String
  extraCosts:       String
  description:      String!
  enhancements:     [SpellEnhancement!]
  effects:          [SpellEffect!]
  isFavorite:       Boolean
  favoriteOrder:    Int
}
type SpellTarget      { amount: Int; upTo: Int; type: String! }
type SpellEnhancement { cost: Int!; type: String!; description: String!; extraDetails: SpellEnhancementDetails }
type SpellEnhancementDetails { execution: String; duration: String; circle: Int; effects: [SpellEffect!] }
type SpellEffect      { type: String!; attribute: String; amount: String; resistanceRequirement: String; extraRequirements: String }

type EquipmentItem {
  id:          ID!
  name:        String!
  description: String
  quantity:    Int
  weight:      Float
  spaces:      Int
  price:       Int
  category:    String
  effects:     [ItemEffect!]
  allowedSlots: [String!]
  twoHanded:   Boolean
  versatile:   Boolean
  usingTwoHanded: Boolean
}

type ItemEffect {
  id:          ID!
  name:        String!
  description: String!
  type:        String!  # 'passive' | 'active' | 'consumable'
  passiveModifiers: ItemPassiveModifiers
  activeAbility:    ItemActiveAbility
}
type ItemPassiveModifiers {
  attribute:  ItemModAttribute
  defense:    ItemModValue
  resistance: ItemModValue
  skill:      ItemModSkill
  other:      ItemModOther
}
type ItemModAttribute { label: String!; bonus: Int! }
type ItemModValue     { type: String!; bonus: Int! }
type ItemModSkill     { name: String!; bonus: Int! }
type ItemModOther     { label: String!; value: String! }
type ItemActiveAbility {
  name:        String!
  description: String!
  actionType:  String!
  cost:        ActionCost
  usesPerDay:  Int
  consumeItem: Boolean
}

type EquippedItems {
  rightHand: EquipmentItem
  leftHand:  EquipmentItem
  quickDraw1: EquipmentItem
  quickDraw2: EquipmentItem
  slot1: EquipmentItem
  slot2: EquipmentItem
  slot3: EquipmentItem
  slot4: EquipmentItem
}

type Currencies { tc: Int!; tp: Int!; to: Int! }

# ─── Inputs ──────────────────────────────────────────────────────────────────

input AttributeInput  { label: String!; value: Int!; modifier: Int!; visible: Boolean! }
input ResistanceInput { name: String!; value: Int!; tooltip: String!; visible: Boolean! }
input DefenseInput    { name: String!; value: Int!; tooltip: String! }

input SkillInput {
  name: String!; modifier: Int!; trained: Boolean!; attribute: String!
  tooltip: String; visibleInCombat: Boolean; visibleInSummary: Boolean
  levelBonus: Int; trainingBonus: Int; otherBonuses: [BonusEntryInput!]
}
input BonusEntryInput { label: String!; value: Int! }

input AvailableActionsInput {
  standard: Int!; movement: Int!; free: Int!; full: Int!; reaction: Int!
}

input CombatActionInput {
  id: ID!; name: String!; type: String!; cost: ActionCostInput
  effect: String!; tooltip: String; modal: Boolean; choices: [String!]
  isFavorite: Boolean; favoriteOrder: Int; usesPerTurn: Int; resistance: String
}
input ActionCostInput { pm: Int; pv: Int }

input WeaponAttackInput {
  id: ID!; name: String!; damage: String!; damageType: String
  attackBonus: Int!; attackAttribute: String; critRange: String; critMultiplier: String
  range: String; actionType: String!; isFavorite: Boolean; favoriteOrder: Int; equipmentId: ID
}

input AbilityInput {
  id: ID!; name: String!; description: String!; type: String!; actionType: String
  cost: ActionCostInput; usesPerDay: Int; source: String; isFavorite: Boolean; favoriteOrder: Int
}

input SpellInput {
  id: ID!; name: String!; type: String!; circle: Int!; school: String!
  execution: String!; executionDetails: String; range: String!; target: SpellTargetInput
  areaEffect: String; areaEffectDetails: String; counterspell: String
  duration: String!; durationDetails: String; resistance: String; extraCosts: String
  description: String!; enhancements: [SpellEnhancementInput!]; effects: [SpellEffectInput!]
  isFavorite: Boolean; favoriteOrder: Int
}
input SpellTargetInput      { amount: Int; upTo: Int; type: String! }
input SpellEnhancementInput { cost: Int!; type: String!; description: String!; extraDetails: SpellEnhancementDetailsInput }
input SpellEnhancementDetailsInput { execution: String; duration: String; circle: Int; effects: [SpellEffectInput!] }
input SpellEffectInput      { type: String!; attribute: String; amount: String; resistanceRequirement: String; extraRequirements: String }

input EquipmentItemInput {
  id: ID!; name: String!; description: String; quantity: Int; weight: Float; spaces: Int
  price: Int; category: String; effects: [ItemEffectInput!]; allowedSlots: [String!]
  twoHanded: Boolean; versatile: Boolean; usingTwoHanded: Boolean
}
input ItemEffectInput {
  id: ID!; name: String!; description: String!; type: String!
  passiveModifiers: ItemPassiveModifiersInput; activeAbility: ItemActiveAbilityInput
}
input ItemPassiveModifiersInput {
  attribute: ItemModAttributeInput; defense: ItemModValueInput
  resistance: ItemModValueInput; skill: ItemModSkillInput; other: ItemModOtherInput
}
input ItemModAttributeInput { label: String!; bonus: Int! }
input ItemModValueInput     { type: String!; bonus: Int! }
input ItemModSkillInput     { name: String!; bonus: Int! }
input ItemModOtherInput     { label: String!; value: String! }
input ItemActiveAbilityInput {
  name: String!; description: String!; actionType: String!
  cost: ActionCostInput; usesPerDay: Int; consumeItem: Boolean
}

input EquippedItemsInput {
  rightHand:  EquipmentItemInput
  leftHand:   EquipmentItemInput
  quickDraw1: EquipmentItemInput
  quickDraw2: EquipmentItemInput
  slot1: EquipmentItemInput
  slot2: EquipmentItemInput
  slot3: EquipmentItemInput
  slot4: EquipmentItemInput
}

input CurrenciesInput { tc: Int!; tp: Int!; to: Int! }

input LevelUpInput {
  classes:    [CharacterClassInput!]!  # Nova lista de classes (com novos níveis)
  maxHealth:  Int!
  maxMana:    Int!
  attributes: [AttributeInput!]
  skills:     [SkillInput!]
}
input CharacterClassInput { name: String!; level: Int!; tooltip: String }

input CreateCharacterInput {
  name:        String!
  imageUrl:    String
  classes:     [CharacterClassInput!]!
  origin:      CharacterInfoInput
  deity:       CharacterInfoInput
  maxHealth:   Int!
  maxMana:     Int!
  attributes:  [AttributeInput!]!
  resistances: [ResistanceInput!]!
  defenses:    [DefenseInput!]!
  skills:      [SkillInput!]!
  abilities:   [AbilityInput!]
  spells:      [SpellInput!]
  weapons:     [WeaponAttackInput!]
  actionsList: [CombatActionInput!]
  equippedItems: EquippedItemsInput!
  backpack:    [EquipmentItemInput]!
  currencies:  CurrenciesInput!
}
input CharacterInfoInput { name: String!; tooltip: String }
```

---

## Campanhas e Hierarquia de Encontros

A hierarquia é: **Campanha → Aventura → Sessão → Encontro**

```graphql
# ─── Queries ─────────────────────────────────────────────────────────────────

# Todas as campanhas de uma mesa
query GetCampaigns(mesaId: ID!): [Campaign!]!

# Campanha específica com toda a hierarquia populada
query GetCampaign(id: ID!): Campaign!

# ─── Mutations — Campanhas ────────────────────────────────────────────────────

mutation CreateCampaign(mesaId: ID!, input: CampaignInput!): Campaign!
mutation UpdateCampaign(id: ID!, input: CampaignInput!): Campaign!
mutation DeleteCampaign(id: ID!): Boolean!

# ─── Mutations — Aventuras ────────────────────────────────────────────────────

mutation CreateAdventure(campaignId: ID!, input: AdventureInput!): Adventure!
mutation UpdateAdventure(id: ID!, input: AdventureInput!): Adventure!
mutation DeleteAdventure(id: ID!): Boolean!

# Baralho de aventuras
mutation AddCardToAdventure(adventureId: ID!, card: DrawnCardInput!): Adventure!
mutation RemoveCardFromAdventure(adventureId: ID!, cardId: ID!): Adventure!
mutation ClearAdventureCards(adventureId: ID!): Adventure!

# ─── Mutations — Sessões ──────────────────────────────────────────────────────

mutation CreateSession(adventureId: ID!, input: SessionInput!): Session!
mutation UpdateSession(id: ID!, input: SessionInput!): Session!
mutation DeleteSession(id: ID!): Boolean!

# ─── Mutations — Encontros ────────────────────────────────────────────────────

mutation CreateEncounter(sessionId: ID!, input: EncounterInput!): Encounter!
mutation UpdateEncounter(id: ID!, input: EncounterInput!): Encounter!
mutation DeleteEncounter(id: ID!): Boolean!

# ─── Mutations — Inimigos no Encontro ────────────────────────────────────────

mutation AddEnemyToEncounter(encounterId: ID!, input: EncounterEnemyInput!): Encounter!
mutation RemoveEnemyFromEncounter(encounterId: ID!, enemyId: ID!): Encounter!
mutation UpdateEnemyInEncounter(encounterId: ID!, enemyId: ID!, input: UpdateEncounterEnemyInput!): Encounter!

# ─── Mutations — NPCs no Encontro ────────────────────────────────────────────

mutation AddNpcToEncounter(encounterId: ID!, npcId: ID!, versionId: ID!): Encounter!
mutation RemoveNpcFromEncounter(encounterId: ID!, npcId: ID!): Encounter!
mutation UpdateNpcInEncounter(encounterId: ID!, npcId: ID!, input: UpdateEncounterNpcInput!): Encounter!

# ─── Mutations — Objetos no Encontro ─────────────────────────────────────────

mutation AddObjectToEncounter(encounterId: ID!, objectId: ID!, quantity: Int!): Encounter!
mutation RemoveObjectFromEncounter(encounterId: ID!, objectId: ID!): Encounter!
mutation UpdateObjectInEncounter(encounterId: ID!, objectId: ID!, input: UpdateEncounterObjectInput!): Encounter!

# ─── Mutations — Recompensas ──────────────────────────────────────────────────

mutation AddReward(encounterId: ID!, input: RewardInput!): Encounter!
mutation UpdateReward(encounterId: ID!, rewardId: ID!, input: RewardInput!): Encounter!
mutation RemoveReward(encounterId: ID!, rewardId: ID!): Encounter!
mutation ToggleRewardDistributed(encounterId: ID!, rewardId: ID!): Encounter!

# ─── Types ───────────────────────────────────────────────────────────────────

type Campaign {
  id:          ID!
  name:        String!
  description: String
  adventures:  [Adventure!]!
  npcs:        [NPC!]!
  objects:     [CampaignObject!]!
  createdAt:   String!
  updatedAt:   String!
}

type Adventure {
  id:          ID!
  name:        String!
  description: String
  drawnCards:  [DrawnCard!]!
  sessions:    [Session!]!
  createdAt:   String!
  updatedAt:   String!
}

type Session {
  id:        ID!
  name:      String!
  number:    Int!
  date:      String
  encounters: [Encounter!]!
  notes:     String
  createdAt: String!
  updatedAt: String!
}

type Encounter {
  id:              ID!
  name:            String!
  description:     String
  status:          EncounterStatus!  # 'draft' | 'ready' | 'active' | 'completed'
  enemies:         [EncounterEnemy!]!
  encounterNpcs:   [EncounterNPC!]!
  encounterObjects: [EncounterObject!]!
  rewards:         [Reward!]!
  createdAt:       String!
  updatedAt:       String!
}

enum EncounterStatus { draft ready active completed }

type EncounterEnemy {
  id:        ID!
  creatureId: ID!
  creature:  Creature!
  nickname:  String
  currentPv: Int!
  notes:     String
  addedAt:   String!
}

type EncounterNPC {
  id:        ID!
  npcId:     ID!
  versionId: ID!
  currentPv: Int
  notes:     String
}

type EncounterObject {
  id:       ID!
  objectId: ID!
  quantity: Int!
  notes:    String
}

type Reward {
  id:          ID!
  type:        RewardType!  # 'xp' | 'gold' | 'item' | 'other'
  name:        String!
  description: String
  quantity:    Int
  value:       Int
  objectId:    ID
  distributed: Boolean!
}

enum RewardType { xp gold item other }

type DrawnCard {
  id:          ID!
  type:        CardType!
  name:        String!
  description: String!
  subcategory: String
  tier:        Int
  drawnAt:     String!
  method:      CardDrawMethod!
  isCustom:    Boolean
}

enum CardType       { plot location character object threat event }
enum CardDrawMethod { nimb khalmyr }

# ─── Inputs ──────────────────────────────────────────────────────────────────

input CampaignInput  { name: String!; description: String }
input AdventureInput { name: String!; description: String }
input SessionInput   { name: String!; number: Int!; date: String; notes: String }
input EncounterInput { name: String!; description: String; status: EncounterStatus }

input EncounterEnemyInput {
  creatureId: ID!
  creature:   CreatureInput!
  nickname:   String
  currentPv:  Int!
  notes:      String
}

input UpdateEncounterEnemyInput {
  nickname:  String
  currentPv: Int
  notes:     String
}

input UpdateEncounterNpcInput  { currentPv: Int; notes: String }
input UpdateEncounterObjectInput { quantity: Int; notes: String }

input DrawnCardInput {
  id:          ID!
  type:        CardType!
  name:        String!
  description: String!
  subcategory: String
  tier:        Int
  drawnAt:     String!
  method:      CardDrawMethod!
  isCustom:    Boolean
}

input RewardInput {
  type:        RewardType!
  name:        String!
  description: String
  quantity:    Int
  value:       Int
  objectId:    ID
}
```

---

## Criaturas (banco de dados do sistema)

Criaturas são entidades **read-only** do sistema (banco de dados do Tormenta 20). O DM pode criar criaturas customizadas.

```graphql
# ─── Queries ─────────────────────────────────────────────────────────────────

# Lista criaturas com filtros opcionais
query GetCreatures(
  tier:    ThreatTierEnum
  type:    CreatureTypeEnum
  search:  String
  limit:   Int
  offset:  Int
): CreaturesResult!

query GetCreature(id: ID!): Creature!

# Criaturas customizadas do usuário (DM)
query GetCustomCreatures: [Creature!]!

# ─── Mutations (apenas criaturas customizadas) ────────────────────────────────

mutation CreateCustomCreature(input: CreatureInput!): Creature!
mutation UpdateCustomCreature(id: ID!, input: CreatureInput!): Creature!
mutation DeleteCustomCreature(id: ID!): Boolean!

# ─── Types ───────────────────────────────────────────────────────────────────

type CreaturesResult {
  creatures:  [Creature!]!
  total:      Int!
  hasMore:    Boolean!
}

type Creature {
  id:           ID!
  name:         String!
  nd:           Float!
  type:         CreatureTypeEnum!
  size:         CreatureSizeEnum!
  ca:           Int!
  pv:           Int!
  deslocamento: String!
  attributes:   CreatureAttributes!
  resistances:  CreatureResistances!
  attacks:      [CreatureAttack!]!
  abilities:    [String!]
  senses:       String
  treasure:     String
  description:  String
  isCustom:     Boolean!
}

type CreatureAttributes {
  for: Int!; des: Int!; con: Int!
  int: Int!; sab: Int!; car: Int!
}

type CreatureResistances {
  fortitude: Int!
  reflexos:  Int!
  vontade:   Int!
}

type CreatureAttack {
  name:  String!
  bonus: Int!
  damage: String!
  type:  String
  extra: String
}

enum ThreatTierEnum {
  tier1  # ND 0-4
  tier2  # ND 5-10
  tier3  # ND 11-16
  tier4  # ND 17-20
}

enum CreatureTypeEnum {
  Humanoide Morto_vivo Construto Monstro
  Animal Espirito Lefou Dragao Elemental
}

enum CreatureSizeEnum {
  Minusculo Pequeno Medio Grande Enorme Colossal
}

# ─── Inputs ──────────────────────────────────────────────────────────────────

input CreatureInput {
  name:         String!
  nd:           Float!
  type:         CreatureTypeEnum!
  size:         CreatureSizeEnum!
  ca:           Int!
  pv:           Int!
  deslocamento: String!
  attributes:   CreatureAttributesInput!
  resistances:  CreatureResistancesInput!
  attacks:      [CreatureAttackInput!]!
  abilities:    [String!]
  senses:       String
  treasure:     String
  description:  String
}

input CreatureAttributesInput {
  for: Int!; des: Int!; con: Int!; int: Int!; sab: Int!; car: Int!
}
input CreatureResistancesInput { fortitude: Int!; reflexos: Int!; vontade: Int! }
input CreatureAttackInput { name: String!; bonus: Int!; damage: String!; type: String; extra: String }
```

---

## NPCs de Campanha

```graphql
# ─── Mutations ───────────────────────────────────────────────────────────────

mutation CreateNpc(campaignId: ID!, input: NpcInput!): NPC!
mutation UpdateNpc(id: ID!, input: NpcInput!): NPC!
mutation DeleteNpc(id: ID!): Boolean!

# Versões do NPC (ex: NPC como aliado vs. versão inimiga)
mutation AddNpcVersion(npcId: ID!, input: NpcVersionInput!): NPC!
mutation UpdateNpcVersion(npcId: ID!, versionId: ID!, input: NpcVersionInput!): NPC!
mutation DeleteNpcVersion(npcId: ID!, versionId: ID!): NPC!

# ─── Types ───────────────────────────────────────────────────────────────────

type NPC {
  id:          ID!
  name:        String!
  title:       String
  description: String
  alignment:   NPCAlignment!  # 'ally' | 'neutral' | 'enemy'
  isCombatant: Boolean!
  versions:    [NPCVersion!]!
  createdAt:   String!
  updatedAt:   String!
}

type NPCVersion {
  id:          ID!
  label:       String!
  creature:    Creature
  description: String
  createdAt:   String!
}

enum NPCAlignment { ally neutral enemy }

# ─── Inputs ──────────────────────────────────────────────────────────────────

input NpcInput {
  name:        String!
  title:       String
  description: String
  alignment:   NPCAlignment!
  isCombatant: Boolean!
}

input NpcVersionInput {
  label:       String!
  creatureId:  ID          # Referência a uma Creature existente
  description: String
}
```

---

## Objetos de Campanha

```graphql
# ─── Mutations ───────────────────────────────────────────────────────────────

mutation CreateObject(campaignId: ID!, input: CampaignObjectInput!): CampaignObject!
mutation UpdateObject(id: ID!, input: CampaignObjectInput!): CampaignObject!
mutation DeleteObject(id: ID!): Boolean!

# ─── Types ───────────────────────────────────────────────────────────────────

type CampaignObject {
  id:          ID!
  name:        String!
  type:        CampaignObjectType!
  description: String
  rarity:      ObjectRarity
  value:       String
  properties:  [String!]
  createdAt:   String!
  updatedAt:   String!
}

enum CampaignObjectType {
  weapon armor magic_item consumable treasure key_item other
}

enum ObjectRarity { common uncommon rare very_rare legendary }

# ─── Inputs ──────────────────────────────────────────────────────────────────

input CampaignObjectInput {
  name:        String!
  type:        CampaignObjectType!
  description: String
  rarity:      ObjectRarity
  value:       String
  properties:  [String!]
}
```

---

## Notas

```graphql
# ─── Queries ─────────────────────────────────────────────────────────────────

# Todas as notas + pastas de uma mesa
query GetNotes(mesaId: ID!): NotesResult!

# ─── Mutations — Notas ───────────────────────────────────────────────────────

mutation CreateNote(mesaId: ID!, input: NoteInput!): Note!
mutation UpdateNote(id: ID!, input: NoteInput!): Note!
mutation DeleteNote(id: ID!): Boolean!
mutation ToggleNotePin(id: ID!): Note!
mutation MoveNoteToFolder(id: ID!, folderId: ID): Note!  # folderId null = raiz

# Links de notas para itens da hierarquia
mutation AddNoteLink(noteId: ID!, link: NoteLinkInput!): Note!
mutation RemoveNoteLink(noteId: ID!, linkId: ID!): Note!

# ─── Mutations — Pastas ──────────────────────────────────────────────────────

mutation CreateNoteFolder(mesaId: ID!, input: NoteFolderInput!): NoteFolder!
mutation RenameNoteFolder(id: ID!, name: String!): NoteFolder!
mutation MoveNoteFolder(id: ID!, parentId: ID): NoteFolder!  # parentId null = raiz
mutation DeleteNoteFolder(id: ID!, deleteChildren: Boolean!): Boolean!

# ─── Types ───────────────────────────────────────────────────────────────────

type NotesResult {
  notes:   [Note!]!
  folders: [NoteFolder!]!
}

type Note {
  id:        ID!
  title:     String!
  content:   String!  # HTML gerado pelo Tiptap
  folderId:  ID
  links:     [NoteLink!]!
  pinned:    Boolean!
  createdAt: String!
  updatedAt: String!
}

type NoteFolder {
  id:        ID!
  name:      String!
  parentId:  ID
  color:     String
  createdAt: String!
}

type NoteLink {
  type:  NoteLinkType!  # 'campaign' | 'adventure' | 'session' | 'encounter'
  id:    ID!
  label: String!
}

enum NoteLinkType { campaign adventure session encounter }

# ─── Inputs ──────────────────────────────────────────────────────────────────

input NoteInput {
  title:    String!
  content:  String!
  folderId: ID
  pinned:   Boolean
}

input NoteLinkInput {
  type:  NoteLinkType!
  id:    ID!
  label: String!
}

input NoteFolderInput {
  name:     String!
  parentId: ID
  color:    String
}
```

---

## Soundboard

A `SoundboardConfig` (slots, customSounds, playlists) é atualmente persistida em `localStorage` via `redux-persist`. Se for necessário sincronizar entre dispositivos, adicionar as mutations abaixo. **Não é bloqueante para a Fase 2.**

```graphql
# ─── Queries ─────────────────────────────────────────────────────────────────

# Carrega a config do soundboard do usuário para a mesa (sync entre dispositivos)
query GetSoundboardConfig(mesaId: ID!): SoundboardConfig!

# ─── Mutations ───────────────────────────────────────────────────────────────

# Sincroniza config completa (chamado no save manual ou logout)
mutation SaveSoundboardConfig(mesaId: ID!, config: SoundboardConfigInput!): SoundboardConfig!

# Alternativa granular (para futura colaboração DM co-DM)
mutation AddCustomSound(mesaId: ID!, input: CustomSoundInput!): SoundboardConfig!
mutation RemoveCustomSound(mesaId: ID!, soundId: ID!): SoundboardConfig!
mutation AddCustomPlaylist(mesaId: ID!, input: PlaylistDefinitionInput!): SoundboardConfig!
mutation RemoveCustomPlaylist(mesaId: ID!, playlistId: ID!): SoundboardConfig!

# ─── Types ───────────────────────────────────────────────────────────────────

type SoundboardConfig {
  slots:            [SoundboardSlot!]!
  customSounds:     [CustomSound!]!
  recentMedia:      [RecentMediaEntry!]!
  playlistSlots:    [PlaylistSlot!]!
  customPlaylists:  [PlaylistDefinition!]!
}

type SoundboardSlot {
  id:                ID!
  soundId:           String!
  isCustom:          Boolean!
  preferredVariantId: ID
  order:             Int!
}

type CustomSound {
  id:        ID!
  name:      String!
  url:       String!
  icon:      String!
  loop:      Boolean!
  category:  String!
  createdAt: String!
}

type RecentMediaEntry { url: String!; label: String!; type: MediaType! }
type PlaylistSlot     { id: ID!; playlistId: String!; isCustom: Boolean!; order: Int! }
type PlaylistDefinition { id: ID!; name: String!; url: String!; icon: String!; type: MediaType! }

enum MediaType { spotify youtube }

# ─── Inputs ──────────────────────────────────────────────────────────────────
# (omitidos por brevidade — seguem a estrutura dos types acima)
```

---

## Combate em Tempo Real (Socket.io)

O estado de combate **não passa por GraphQL** — é gerenciado via Socket.io para baixa latência. O servidor deve manter o `CombatState` em memória (Redis ou in-memory) durante o combate e sincronizar com o banco ao fim.

### Eventos emitidos pelo DM → Servidor

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `combat:start` | `{ mesaId, encounterId }` | Inicia o combate |
| `combat:request_initiative` | `{ mesaId, encounterId }` | Pede rolagem de iniciativa dos jogadores |
| `combat:set_initiative` | `{ mesaId, entryId, initiative }` | DM define iniciativa de um inimigo/NPC |
| `combat:next_turn` | `{ mesaId }` | Avança para o próximo turno |
| `combat:previous_turn` | `{ mesaId }` | Volta um turno |
| `combat:update_entry` | `{ mesaId, entryId, updates }` | Atualiza PV, condições, ações de uma entrada |
| `combat:add_entry` | `{ mesaId, entry }` | Adiciona combatente ao vivo |
| `combat:remove_entry` | `{ mesaId, entryId }` | Remove combatente |
| `combat:end` | `{ mesaId, encounterId }` | Encerra o combate |

### Eventos emitidos pelo Jogador → Servidor

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `combat:roll_initiative` | `{ mesaId, characterId, characterName, initiative }` | Jogador envia sua rolagem |

### Eventos emitidos pelo Servidor → Clientes (broadcast)

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `combat:state_update` | `CombatState` | Estado completo atualizado (após qualquer mudança) |
| `combat:initiative_request` | `{ encounterId }` | Pede rolagem de iniciativa para todos os jogadores |
| `combat:turn_changed` | `{ currentEntry, round }` | Notifica mudança de turno |
| `combat:ended` | `{ encounterId }` | Combate encerrado |

### Persistência pós-combate

Ao receber `combat:end`, o servidor deve salvar um resumo no banco via GraphQL interno:

```graphql
# Chamada interna do servidor (não exposta ao cliente)
mutation SaveCombatSummary(encounterId: ID!, input: CombatSummaryInput!): Boolean!

input CombatSummaryInput {
  rounds:     Int!
  duration:   Int!      # segundos
  entries:    [CombatEntrySummaryInput!]!
}

input CombatEntrySummaryInput {
  sourceId:   ID!
  name:       String!
  type:       String!   # 'player' | 'enemy' | 'npc'
  isDefeated: Boolean!
}
```

### Salas Socket.io

Cada mesa tem uma sala: `mesa:{mesaId}`. Sub-salas opcionais: `mesa:{mesaId}:combat`.

---

## Upload de Arquivos

Upload de imagens via REST multipart (não GraphQL):

```
POST /api/upload/character-image
Content-Type: multipart/form-data
Body: { file: <imagem> }
Response: { url: string }

POST /api/upload/mesa-image
Content-Type: multipart/form-data
Body: { file: <imagem> }
Response: { url: string }
```

Limites sugeridos: máx 5MB por imagem, formatos aceitos: JPG, PNG, WebP.

---

## Erros e Paginação

### Erros GraphQL

```graphql
# Extensões de erro padrão
type ErrorExtensions {
  code:    ErrorCode!
  message: String!
}

enum ErrorCode {
  UNAUTHENTICATED    # 401 — sem token ou token inválido
  FORBIDDEN          # 403 — sem permissão para este recurso
  NOT_FOUND          # 404 — recurso não existe
  VALIDATION_ERROR   # 422 — dados inválidos
  INTERNAL_ERROR     # 500 — erro do servidor
}
```

### Paginação (cursor-based para listas grandes)

```graphql
# Usado em GetCreatures — listas potencialmente grandes
type CreaturesResult {
  creatures: [Creature!]!
  total:     Int!
  hasMore:   Boolean!
}
# Parâmetros: limit (default 50, max 200) + offset
```

---

## Resumo de Permissões

| Recurso | Leitura | Escrita |
|---------|---------|---------|
| Mesa | DM da mesa, jogadores vinculados | DM da mesa |
| Character | Dono do personagem, DM da mesa | Dono do personagem |
| Campaign + hierarquia | DM da mesa | DM da mesa |
| Creature (sistema) | Qualquer usuário autenticado | Apenas admin |
| Custom Creature | Criador | Criador |
| Notes | DM da mesa | DM da mesa |
| Soundboard config | Usuário | Usuário |
| Combat (socket) | DM + jogadores da mesa | DM (controle) + Jogadores (iniciativa) |

---

*Próximo passo: Fase 2 — instalar `@apollo/client graphql`, configurar `ApolloProvider` em `app/root.tsx`, substituir os loaders mockados por `useQuery`, e mutations por `useMutation` com `optimisticResponse`.*
