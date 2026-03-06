# Contexto para Desenvolvimento da API — Arkheion

## O que é o Arkheion

Aplicação web de gerenciamento de RPG de mesa (Tormenta 20). Possui dois lados:

- **DM Dashboard** (`/dm/mesas/:mesaId`) — painel do Mestre com visão dos personagens, gerenciador de encontros (Campanha → Aventura → Sessão → Encontro), notas, soundboard e combate em tempo real
- **Ficha de Personagem** (`/characters/:characterId`) — ficha completa do jogador com PV, PM, atributos, habilidades, magias, equipamentos, inventário, ações de combate

## Stack do Frontend (cliente que vai consumir a API)

| Tecnologia | Versão / Notas |
|------------|---------------|
| **Remix** | SSR + loaders/actions |
| **React** | 18 |
| **TypeScript** | Strict |
| **Redux Toolkit** | State management (já implementado com slices) |
| **redux-persist** | Persiste `soundboard` e `ui` em localStorage |
| **Socket.io-client** | Combate em tempo real |
| **Apollo Client** | **A ser instalado na Fase 2** — substituirá os loaders mockados |

## Estado atual do frontend

Toda a camada de dados é **mockada** em loaders Remix. Não existe backend ainda. O contrato de API está documentado em `API_REQUIREMENTS.md` (na raiz do projeto).

### Slices Redux existentes (o que o frontend espera da API)

| Slice | Dados | Origem esperada |
|-------|-------|-----------------|
| `mesaSlice` | `MesaWithCharacters` | `query GetMesa(id)` |
| `encountersSlice` | `Campaign[]` com hierarquia | `query GetCampaigns(mesaId)` |
| `notesSlice` | `Note[]` + `NoteFolder[]` | `query GetNotes(mesaId)` |
| `characterSlice` | `Character` completo | `query GetCharacter(id)` |
| `soundboardSlice` | `SoundboardConfig` | localStorage (não precisa de API) |
| `uiSlice` | IDs de navegação, snapshotFields | localStorage (não precisa de API) |
| `combatSlice` | `CombatState` | Socket.io (não é GraphQL) |
| `wizardSlice` | Wizard de criação | Só envia no submit final |

## Estrutura de tipos TypeScript do frontend

Os tipos estão em `app/types/`:

- `app/types/character.ts` — `Character`, `Ability`, `Spell`, `WeaponAttack`, `EquipmentItem`, `Skill`, etc.
- `app/types/encounter.ts` — `Campaign`, `Adventure`, `Session`, `Encounter`, `Creature`, `NPC`, `CampaignObject`, `Reward`, `DrawnCard`
- `app/types/notes.ts` — `Note`, `NoteFolder`, `NoteLink`
- `app/types/mesa.ts` — `Mesa`, `MesaWithCharacters`, `MesaSummary`, `PartySnapshotField`
- `app/types/combat.ts` — `CombatState`, `InitiativeEntry`, payloads de Socket.io
- `app/types/soundboard.ts` — `SoundboardConfig`, `SoundboardSlot`, `CustomSound`

## Decisões de arquitetura relevantes para a API

### 1. Updates otimistas no cliente
O frontend faz updates otimistas com debounce de 1 segundo antes de chamar a API. Por isso, mutations de update de personagem são chamadas frequentemente com payloads parciais. O servidor **não precisa lidar com conflitos de versão** nesta fase — last-write-wins.

### 2. `version` no Character
O tipo `Character` tem `version: number`. O servidor deve incrementar a cada update para eventual conflict resolution no futuro.

### 3. Combate é 100% Socket.io
Não tem GraphQL para combate. O servidor mantém `CombatState` em memória durante o combate (Redis ou in-memory). Ao encerrar, persiste um resumo.

### 4. Hierarquia de encontros é nested
A hierarquia Campanha → Aventura → Sessão → Encontro é retornada **populada** na query `GetCampaign`. O frontend navega por drill-down local sem fazer queries intermediárias.

### 5. Auth via JWT + cookie HttpOnly
O token é enviado como cookie HttpOnly. O cliente Apollo envia automaticamente via `credentials: 'include'`.

### 6. Contextos que permanecem no cliente (sem API)
- `SocketContext` — lifecycle do Socket.io
- `ToastContext` — side-effect de UI
- `AudioEngineContext` — refs do Web Audio API

## Como o frontend vai se conectar (Fase 2)

```ts
// app/lib/apollo.ts (a ser criado)
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: process.env.GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include', // envia cookie JWT
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})
```

```tsx
// app/root.tsx — já tem <Provider store={store}>
// adicionar <ApolloProvider client={apolloClient}> dentro do Provider
```

### Substituição de loader mockado (exemplo)

```ts
// ANTES (mock em loader Remix)
export async function loader({ params }) {
  return json({ mesa: mockMesa })
}
function Component() {
  const { mesa } = useLoaderData()
}

// DEPOIS (Apollo)
function Component() {
  const { data, loading } = useQuery(GET_MESA, { variables: { id: mesaId } })
}
```

## Arquivo de referência principal

Ver `API_REQUIREMENTS.md` na raiz do projeto para o **schema GraphQL completo** com todos os types, queries, mutations e inputs.

## Contexto do jogo (Tormenta 20)

- Sistema de RPG brasileiro, regras similares ao D&D 3.5 / Pathfinder
- Atributos: FOR, DES, CON, INT, SAB, CAR
- Resistências: Fortitude, Reflexos, Vontade
- Recursos: PV (pontos de vida), PM (pontos de mana)
- Moedas: TC (tibares de cobre), TP (tibares de prata), TO (tibares de ouro)
- Ameaças classificadas por Nível de Desafio (ND): tier1 ND0-4, tier2 ND5-10, tier3 ND11-16, tier4 ND17-20
- NPCs têm alinhamento: aliado / neutro / inimigo
- Raridade de itens: comum, incomum, raro, muito raro, lendário
