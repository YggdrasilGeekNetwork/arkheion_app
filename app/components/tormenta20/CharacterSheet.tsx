import { useState } from 'react'
import TopBar from './TopBar'
import CharacterHeader from './CharacterHeader'
import HealthCard from './HealthCard'
import ManaCard from './ManaCard'
import ResistanceCard from './ResistanceCard'
import BottomNavigation from './BottomNavigation'
import DefenseCard from './DefenseCard'
import SpellDCCard from './SpellDCCard'
import InitiativeCard from './InitiativeCard'
import { DiceRollProvider } from '~/contexts/DiceRollContext'
import { useDiceRoll } from '~/contexts/DiceRollContext'
import DiceRollDisplay from './DiceRollDisplay'
import Rollable from './Rollable'
import SensesCard from './SensesCard'
import ProficienciesCard from './ProficienciesCard'
import EquipmentCard from './EquipmentCard'
import Tooltip from './Tooltip'

const CharacterSheetInner = () => {
  const [activeNav, setActiveNav] = useState('summary')

  // On desktop, if summary is selected, show combat on the right
  const activeNavDesktop = activeNav === 'summary' ? 'combat' : activeNav
  const [health, setHealth] = useState(20)
  const [maxHealth] = useState(25)
  const [mana, setMana] = useState(10)
  const [maxMana] = useState(15)
  const { addRoll } = useDiceRoll()

  const deathThreshold = Math.min(-10, -Math.floor(maxHealth / 2))
  const isDead = health <= deathThreshold

  const handleBleedingRoll = () => {
    const {total} = addRoll('Sangramento (d6)', 0, 6)
    setHealth(prev => prev - total)
  }

  const handleConRoll = () => {
    const conModifier = attributes.find(a => a.label === 'CON')?.modifier || 0
    addRoll('Estabilizar (CON)', conModifier)
  }

  const handleResurrect = () => {
    setHealth(1)
  }
  const [resistances, setResistances] = useState([
    {
      value: 5,
      name: 'Fortitude',
      tooltip: 'Resistência contra venenos, doenças e efeitos físicos',
      visible: true
    },
    {
      value: 3,
      name: 'Reflexos',
      tooltip: 'Resistência para esquivar de ataques de área e armadilhas',
      visible: true
    },
    {
      value: 2,
      name: 'Vontade',
      tooltip: 'Resistência contra efeitos mentais e mágicos',
      visible: true
    },
    {
      value: 4,
      name: 'Acrobacia',
      tooltip: 'Equilíbrio, saltos e manobras acrobáticas',
      visible: false
    },
    {
      value: 2,
      name: 'Atletismo',
      tooltip: 'Escalar, nadar e atividades físicas',
      visible: false
    },
    {
      value: 3,
      name: 'Cavalgar',
      tooltip: 'Montar e controlar montarias',
      visible: false
    },
    {
      value: 1,
      name: 'Conhecimento',
      tooltip: 'Conhecimento sobre história, magia, natureza, etc',
      visible: false
    },
    {
      value: 2,
      name: 'Cura',
      tooltip: 'Tratar ferimentos e doenças',
      visible: false
    },
    {
      value: 5,
      name: 'Diplomacia',
      tooltip: 'Negociar e persuadir',
      visible: false
    },
    {
      value: 0,
      name: 'Enganação',
      tooltip: 'Mentir e dissimular',
      visible: false
    },
    {
      value: 4,
      name: 'Furtividade',
      tooltip: 'Mover-se silenciosamente e esconder-se',
      visible: false
    },
    {
      value: 3,
      name: 'Iniciativa',
      tooltip: 'Agilidade para reagir em combate',
      visible: false
    },
    {
      value: 2,
      name: 'Intimidação',
      tooltip: 'Coagir e ameaçar',
      visible: false
    },
    {
      value: 1,
      name: 'Intuição',
      tooltip: 'Perceber mentiras e intenções',
      visible: false
    },
    {
      value: 3,
      name: 'Investigação',
      tooltip: 'Procurar pistas e analisar evidências',
      visible: false
    },
    {
      value: 2,
      name: 'Lidar com Animais',
      tooltip: 'Treinar e acalmar animais',
      visible: false
    },
    {
      value: 4,
      name: 'Luta',
      tooltip: 'Combate corpo a corpo',
      visible: false
    },
    {
      value: 0,
      name: 'Misticismo',
      tooltip: 'Conhecimento sobre magia e o sobrenatural',
      visible: false
    },
    {
      value: 2,
      name: 'Percepção',
      tooltip: 'Notar detalhes e perigos',
      visible: false
    },
    {
      value: 1,
      name: 'Pontaria',
      tooltip: 'Ataques à distância',
      visible: false
    },
    {
      value: 3,
      name: 'Sobrevivência',
      tooltip: 'Rastrear, caçar e sobreviver na natureza',
      visible: false
    },
  ])

  const [senses, setSenses] = useState([
    {
      name: 'Visão no Escuro',
      value: '18m',
      tooltip: 'Enxerga no escuro como se fosse penumbra',
      visible: false
    },
    {
      name: 'Visão na Penumbra',
      value: 'Sim',
      tooltip: 'Enxerga em penumbra como se fosse luz plena',
      visible: false
    },
    {
      name: 'Percepção Passiva',
      value: 12,
      tooltip: 'Capacidade de notar coisas sem procurar ativamente',
      visible: true
    },
    {
      name: 'Intuição Passiva',
      value: 10,
      tooltip: 'Capacidade de perceber mentiras e intenções',
      visible: true
    },
    {
      name: 'Investigação Passiva',
      value: 11,
      tooltip: 'Capacidade de encontrar pistas sem procurar ativamente',
      visible: true
    },
  ])

  const [proficiencies, setProficiencies] = useState([
    {
      name: 'Armas Simples',
      tooltip: 'Adaga, clava, cajado, etc',
      visible: true
    },
    {
      name: 'Armas Marciais',
      tooltip: 'Espada longa, arco longo, machado de batalha, etc',
      visible: true
    },
    {
      name: 'Armaduras Leves',
      tooltip: 'Couro, couro batido',
      visible: false
    },
    {
      name: 'Armaduras Médias',
      tooltip: 'Cota de malha, brunea',
      visible: false
    },
    {
      name: 'Armaduras Pesadas',
      tooltip: 'Meia-armadura, armadura completa',
      visible: false
    },
    {
      name: 'Escudos',
      tooltip: 'Todos os tipos de escudo',
      visible: false
    },
  ])

  const attributes = [
    { label: 'FOR', modifier: 0 },
    { label: 'DES', modifier: 1 },
    { label: 'CON', modifier: 2 },
    { label: 'INT', modifier: -1 },
    { label: 'SAB', modifier: 0 },
    { label: 'CAR', modifier: 1 },
  ]

  const [equippedItems, setEquippedItems] = useState({
    rightHand: { name: 'Espada Longa', description: '+1d8 dano' },
    leftHand: { name: 'Escudo', description: '+2 defesa' },
    quickDraw1: { name: 'Poção de Cura' },
    quickDraw2: null,
    slot1: { name: 'Armadura de Couro' },
    slot2: { name: 'Anel de Proteção' },
    slot3: { name: 'Manto élfico' },
    slot4: null,
  })

  const [backpack, setBackpack] = useState([
    { name: 'Corda (15m)' },
    { name: 'Tocha' },
    { name: 'Ração (5 dias)' },
    { name: 'Kit de Primeiros Socorros' },
    null,
    { name: 'Livro de Magias' },
    { name: 'Pederneira' },
    null,
    { name: 'Mapa da região' },
    { name: 'Barraca' },
  ])

  const [currencies, setCurrencies] = useState({
    tc: 50,  // Tibares de Cobre
    tp: 20,  // Tibares de Prata
    to: 5,   // Tibares de Ouro
  })

  const navItemsMobile = [
    { id: 'summary', label: 'Resumo' },
    { id: 'combat', label: 'Combate' },
    { id: 'skills', label: 'Perícias' },
    { id: 'abilities', label: 'Habilidades' },
    { id: 'inventory', label: 'Inventário' },
  ]

  const navItemsDesktop = [
    { id: 'combat', label: 'Combate' },
    { id: 'skills', label: 'Perícias' },
    { id: 'abilities', label: 'Habilidades' },
    { id: 'inventory', label: 'Inventário' },
  ]

  return (
      <div className="w-full max-w-[430px] md:max-w-none h-[100dvh] bg-bg flex flex-col relative">
        <TopBar onAllCharacters={() => console.log('Todos os Personagens')} />

        <CharacterHeader
          name="Nome do Personagem"
          imageUrl="https://via.placeholder.com/150"
          classes={[
            { name: 'Guerreiro', level: 5, tooltip: 'Especialista em combate corpo a corpo' },
            { name: 'Paladino', level: 3, tooltip: 'Guerreiro sagrado de Khalmyr' }
          ]}
          origin={{ name: 'Humano', tooltip: 'Versátil e adaptável' }}
          deity={{ name: 'Khalmyr', tooltip: 'Deus da Justiça e da Guerra' }}
          onSettings={() => console.log('Settings')}
        />

        <DiceRollDisplay />

        <div className={`flex-1 pb-[5vh] md:pb-[2vh] transition-opacity ${isDead ? 'opacity-40 pointer-events-none' : ''}`}>
          {/* MOBILE: Single column view */}
          <div className="md:hidden px-[2vw] py-[1vh]">
          {/* RESUMO TAB */}
          {activeNav === 'summary' && (
            <>
            {/* Attributes Section */}
            <div className="grid grid-cols-6 gap-[0.5vw] mb-[1vh]">
              {attributes.map((attr) => (
                <div key={attr.label} className="flex flex-col items-center bg-card border border-stroke rounded-lg p-1">
                  <div className="text-xs font-semibold text-muted">{attr.label}</div>
                  <Rollable label={attr.label} modifier={attr.modifier}>
                    <div className="text-base font-bold">{attr.modifier >= 0 ? '+' : ''}{attr.modifier}</div>
                  </Rollable>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
              <HealthCard
                current={health}
                max={maxHealth}
                onChange={(delta) => setHealth(prev => prev + delta)}
                onBleedingRoll={handleBleedingRoll}
                onConRoll={handleConRoll}
              />

              <ManaCard
                current={mana}
                max={maxMana}
                onChange={(delta) => setMana(prev => Math.max(0, prev + delta))}
              />
            </div>

            {/* Separator */}
            <div className="h-px bg-stroke mb-[1vh]" />

            <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
              <DefenseCard
                attributes={attributes}
                armor={2}
                shield={2}
                others={3}
                othersDetails={[
                  { label: 'Anel de Proteção', value: 1 },
                  { label: 'Abrigo', value: 2 },
                ]}
              />

              <ResistanceCard resistances={resistances} onResistancesChange={setResistances} />
            </div>

            {/* Separator */}
            <div className="h-px bg-stroke mb-[1vh]" />

            {/* Misc Info Section */}
            <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
              <Tooltip content="Sem bônus ou penalidade por tamanho" className="cursor-help">
                <div className="bg-card border border-stroke rounded-lg p-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted">Tamanho <span className="opacity-50">?</span></span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">Médio</span>
                      <span>|</span>
                      <span className="text-muted">+0/-0</span>
                    </div>
                  </div>
                </div>
              </Tooltip>

              <div className="bg-card border border-stroke rounded-lg p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted">Deslocamento</span>
                  <span className="font-bold">9m / 6q</span>
                </div>
              </div>

              <SpellDCCard
                attributes={attributes}
                hasSpells={true}
                proficiencyBonus={2}
              />

              <InitiativeCard
                attributes={attributes}
                onSwitchToCombat={() => setActiveNav('combat')}
              />
            </div>

            {/* Separator */}
            <div className="h-px bg-stroke mb-[1vh]" />

            {/* Senses, Proficiencies Section */}
            <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
              <SensesCard
                senses={senses}
                onSensesChange={setSenses}
              />

              <ProficienciesCard
                proficiencies={proficiencies}
                onProficienciesChange={setProficiencies}
              />
            </div>

            {/* Separator */}
            <div className="h-px bg-stroke mb-[1vh]" />

            {/* Equipment Section */}
            <EquipmentCard
              desModifier={attributes.find(a => a.label === 'DES')?.modifier || 0}
              equippedItems={equippedItems}
              backpack={backpack}
              currencies={currencies}
              onBackpackChange={setBackpack}
              onEquippedItemsChange={setEquippedItems}
              onCurrenciesChange={setCurrencies}
            />
            </>
          )}

          {/* COMBATE TAB */}
          {activeNav === 'combat' && (
            <>
            {/* Attributes Section */}
            <div className="grid grid-cols-6 gap-[0.5vw] mb-[1vh]">
              {attributes.map((attr) => (
                <div key={attr.label} className="flex flex-col items-center bg-card border border-stroke rounded-lg p-1">
                  <div className="text-xs font-semibold text-muted">{attr.label}</div>
                  <Rollable label={attr.label} modifier={attr.modifier}>
                    <div className="text-base font-bold">{attr.modifier >= 0 ? '+' : ''}{attr.modifier}</div>
                  </Rollable>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
              <HealthCard
                current={health}
                max={maxHealth}
                onChange={(delta) => setHealth(prev => prev + delta)}
                onBleedingRoll={handleBleedingRoll}
                onConRoll={handleConRoll}
              />

              <ManaCard
                current={mana}
                max={maxMana}
                onChange={(delta) => setMana(prev => Math.max(0, prev + delta))}
              />
            </div>

            {/* Separator */}
            <div className="h-px bg-stroke mb-[1vh]" />

            <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
              <DefenseCard
                attributes={attributes}
                armor={2}
                shield={2}
                others={3}
                othersDetails={[
                  { label: 'Anel de Proteção', value: 1 },
                  { label: 'Abrigo', value: 2 },
                ]}
              />

              <InitiativeCard
                attributes={attributes}
                onSwitchToCombat={() => setActiveNav('combat')}
              />
            </div>

            {/* Separator */}
            <div className="h-px bg-stroke mb-[1vh]" />

            <ResistanceCard resistances={resistances} onResistancesChange={setResistances} />
            </>
          )}

          {/* PERÍCIAS TAB */}
          {activeNav === 'skills' && (
            <>
              <ResistanceCard resistances={resistances} onResistancesChange={setResistances} />
            </>
          )}

          {/* HABILIDADES TAB */}
          {activeNav === 'abilities' && (
            <>
              <div className="bg-card border border-stroke rounded-lg p-4 text-center">
                <div className="text-sm text-muted">Habilidades do personagem serão exibidas aqui</div>
              </div>
            </>
          )}

          {/* INVENTÁRIO TAB */}
          {activeNav === 'inventory' && (
            <>
              <EquipmentCard
                desModifier={attributes.find(a => a.label === 'DES')?.modifier || 0}
                equippedItems={equippedItems}
                backpack={backpack}
                currencies={currencies}
                onBackpackChange={setBackpack}
                onEquippedItemsChange={setEquippedItems}
                onCurrenciesChange={setCurrencies}
              />
            </>
          )}
          </div>

          {/* DESKTOP/TABLET: Two column view */}
          <div className="hidden md:flex md:justify-center md:py-[1vh] flex-1">
            <div className="flex gap-[1.5vw] w-full max-w-[95vw] px-[2vw]">
              {/* LEFT COLUMN: Always shows Summary */}
              <div className="flex-1 min-w-0">
              {/* Attributes Section */}
              <div className="grid grid-cols-6 gap-1.5 mb-1.5">
                {attributes.map((attr) => (
                  <div key={attr.label} className="flex flex-col items-center bg-card border border-stroke rounded-lg p-1">
                    <div className="text-xs font-semibold text-muted">{attr.label}</div>
                    <Rollable label={attr.label} modifier={attr.modifier}>
                      <div className="text-base font-bold">{attr.modifier >= 0 ? '+' : ''}{attr.modifier}</div>
                    </Rollable>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
                <HealthCard
                  current={health}
                  max={maxHealth}
                  onChange={(delta) => setHealth(prev => prev + delta)}
                  onBleedingRoll={handleBleedingRoll}
                  onConRoll={handleConRoll}
                />

                <ManaCard
                  current={mana}
                  max={maxMana}
                  onChange={(delta) => setMana(prev => Math.max(0, prev + delta))}
                />
              </div>

              {/* Separator */}
              <div className="h-px bg-stroke mb-1.5" />

              <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
                <DefenseCard
                  attributes={attributes}
                  armor={2}
                  shield={2}
                  others={3}
                  othersDetails={[
                    { label: 'Anel de Proteção', value: 1 },
                    { label: 'Abrigo', value: 2 },
                  ]}
                />

                <ResistanceCard resistances={resistances} onResistancesChange={setResistances} />
              </div>

              {/* Separator */}
              <div className="h-px bg-stroke mb-1.5" />

              {/* Misc Info Section */}
              <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
                <Tooltip content="Sem bônus ou penalidade por tamanho" className="cursor-help">
                  <div className="bg-card border border-stroke rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted">Tamanho <span className="opacity-50">?</span></span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">Médio</span>
                        <span>|</span>
                        <span className="text-muted">+0/-0</span>
                      </div>
                    </div>
                  </div>
                </Tooltip>

                <div className="bg-card border border-stroke rounded-lg p-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted">Deslocamento</span>
                    <span className="font-bold">9m / 6q</span>
                  </div>
                </div>

                <SpellDCCard
                  attributes={attributes}
                  hasSpells={true}
                  proficiencyBonus={2}
                />

                <InitiativeCard
                  attributes={attributes}
                  onSwitchToCombat={() => setActiveNav('combat')}
                />
              </div>

              {/* Separator */}
              <div className="h-px bg-stroke mb-1.5" />

              {/* Senses, Proficiencies Section */}
              <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
                <SensesCard
                  senses={senses}
                  onSensesChange={setSenses}
                />

                <ProficienciesCard
                  proficiencies={proficiencies}
                  onProficienciesChange={setProficiencies}
                />
              </div>

              {/* Separator */}
              <div className="h-px bg-stroke mb-1.5" />

              {/* Equipment Section */}
              <EquipmentCard
                desModifier={attributes.find(a => a.label === 'DES')?.modifier || 0}
                equippedItems={equippedItems}
                backpack={backpack}
                currencies={currencies}
                onBackpackChange={setBackpack}
                onEquippedItemsChange={setEquippedItems}
                onCurrenciesChange={setCurrencies}
              />
              </div>

              {/* Vertical Separator */}
              <div className="w-px bg-stroke flex-shrink-0" />

              {/* RIGHT COLUMN: Shows other tabs */}
              <div className="flex-1 min-w-0 flex flex-col">
              {/* COMBATE TAB */}
              {activeNavDesktop === 'combat' && (
                <>
                  <div className="bg-card border border-stroke rounded-lg p-4 text-center">
                    <div className="text-sm text-muted">Informações adicionais de combate serão exibidas aqui</div>
                  </div>
                </>
              )}

              {/* PERÍCIAS TAB */}
              {activeNavDesktop === 'skills' && (
                <>
                  <ResistanceCard resistances={resistances} onResistancesChange={setResistances} />
                </>
              )}

              {/* HABILIDADES TAB */}
              {activeNavDesktop === 'abilities' && (
                <>
                  <div className="bg-card border border-stroke rounded-lg p-4 text-center">
                    <div className="text-sm text-muted">Habilidades do personagem serão exibidas aqui</div>
                  </div>
                </>
              )}

              {/* INVENTÁRIO TAB */}
              {activeNavDesktop === 'inventory' && (
                <>
                  <EquipmentCard
                    desModifier={attributes.find(a => a.label === 'DES')?.modifier || 0}
                    equippedItems={equippedItems}
                    backpack={backpack}
                    currencies={currencies}
                    onBackpackChange={setBackpack}
                    onEquippedItemsChange={setEquippedItems}
                    onCurrenciesChange={setCurrencies}
                  />
                </>
              )}

              {/* Desktop/Tablet Navigation - Inside right column */}
              <div className="mt-auto pt-[2vh]">
                <BottomNavigation
                  items={navItemsDesktop}
                  activeItem={activeNavDesktop}
                  onItemChange={setActiveNav}
                  isFixed={false}
                />
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <BottomNavigation
            items={navItemsMobile}
            activeItem={activeNav}
            onItemChange={setActiveNav}
          />
        </div>

        {/* Resurrection Overlay */}
        {isDead && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-card border-2 border-red-600 rounded-lg p-6 shadow-2xl text-center">
              <div className="text-2xl font-bold text-red-600 mb-4">Você Morreu</div>
              <div className="text-sm font-bold mb-4">A aventura terminou... Ou será que não?</div>
              <button
                onClick={handleResurrect}
                className="px-6 py-3 bg-accent text-card rounded-lg hover:bg-accent-hover transition-colors text-lg font-semibold"
              >
                Ressuscitar?
              </button>
            </div>
          </div>
        )}
      </div>
  )
}

const CharacterSheet = () => (
  <DiceRollProvider>
    <CharacterSheetInner />
  </DiceRollProvider>
)

export default CharacterSheet