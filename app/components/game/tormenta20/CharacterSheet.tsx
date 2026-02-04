import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from '@remix-run/react'
import TopBar from './TopBar'
import CharacterHeader from './CharacterHeader'
import BottomNavigation from './BottomNavigation'
import { DiceRollProvider } from '~/contexts/DiceRollContext'
import { useDiceRoll } from '~/contexts/DiceRollContext'
import { useCharacter } from '~/contexts/CharacterContext'
import DiceRollDisplay from './DiceRollDisplay'
import type { CombatAction, WeaponAttack, AvailableActions, ActiveEffect, EquipmentItem, Ability } from '~/types/character'
import { getTotalLevel } from '~/utils/tormenta20'
import SummaryTab from './tabs/SummaryTab'
import CombatTab from './tabs/CombatTab'
import AbilitiesTab from './tabs/AbilitiesTab'
import InventoryTab from './tabs/InventoryTab'
import OtherTab from './tabs/OtherTab'
import DesktopView from './tabs/DesktopView'
import Modal from '~/components/ui/Modal'

const ACTION_COST_LABELS: Record<string, string> = {
  standard: 'Ação Padrão',
  movement: 'Ação de Movimento',
  free: 'Ação Livre',
  full: 'Ação Completa',
  reaction: 'Reação',
}

type CharacterSheetInnerProps = {
  onBackToCharacters?: () => void
}

const CharacterSheetInner = ({ onBackToCharacters }: CharacterSheetInnerProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') || 'summary'
  const [activeNav, setActiveNav] = useState(tabFromUrl)
  const [isUpdating, setIsUpdating] = useState(false)
  const { state, optimisticDispatch } = useCharacter()
  const { addRoll } = useDiceRoll()

  // Sync activeNav with URL on mount/URL change
  useEffect(() => {
    const tab = searchParams.get('tab') || 'summary'
    if (tab !== activeNav) {
      setActiveNav(tab)
    }
  }, [searchParams])

  // Update URL when activeNav changes (without reload)
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'summary'
    if (currentTab !== activeNav) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('tab', activeNav)
      window.history.pushState({}, '', newUrl.toString())
    }
  }, [activeNav])

  // For now, keep senses and proficiencies as local state since they're not in the Character type yet
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

  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([])
  const [pendingCombatConfirmation, setPendingCombatConfirmation] = useState<{
    description: string
    actionCost: string
    execute: () => void
  } | null>(null)

  const [weaponModalOpen, setWeaponModalOpen] = useState(false)
  const [choiceModalOpen, setChoiceModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<CombatAction | null>(null)

  // On desktop, if summary is selected, show combat on the right
  const activeNavDesktop = activeNav === 'summary' ? 'combat' : activeNav

  const character = state.character

  // Loading state
  if (!character) {
    return (
      <div className="w-full md:max-w-none h-[100dvh] bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <div className="text-xl font-bold mb-2">Carregando personagem...</div>
          <div className="text-muted">Aguarde um momento</div>
        </div>
      </div>
    )
  }

  const deathThreshold = Math.min(-10, -Math.floor(character.maxHealth / 2))
  const isDead = character.health <= deathThreshold

  const handleHealthChange = async (delta: number) => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_HEALTH',
        payload: character.health + delta,
      })
    } catch (error) {
      console.error('Failed to update health:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleManaChange = async (delta: number) => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_MANA',
        payload: Math.max(0, character.mana + delta),
      })
    } catch (error) {
      console.error('Failed to update mana:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBleedingRoll = async () => {
    const { total } = addRoll('Sangramento (d6)', 0, 6)
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_HEALTH',
        payload: character.health - total,
      })
    } catch (error) {
      console.error('Failed to update health:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConRoll = () => {
    const conModifier = character.attributes.find(a => a.label === 'CON')?.modifier || 0
    addRoll('Estabilizar (CON)', conModifier)
  }

  const handleResurrect = async () => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_HEALTH',
        payload: 1,
      })
    } catch (error) {
      console.error('Failed to resurrect:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResistancesChange = async (newResistances: typeof character.resistances) => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_RESISTANCES',
        payload: newResistances,
      })
    } catch (error) {
      console.error('Failed to update resistances:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSkillsChange = async (newSkills: typeof character.skills) => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_SKILLS',
        payload: newSkills,
      })
    } catch (error) {
      console.error('Failed to update skills:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEquippedItemsChange = async (newEquippedItems: typeof character.equippedItems) => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_EQUIPPED_ITEMS',
        payload: newEquippedItems,
      })
    } catch (error) {
      console.error('Failed to update equipped items:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBackpackChange = async (newBackpack: typeof character.backpack) => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_BACKPACK',
        payload: newBackpack,
      })
    } catch (error) {
      console.error('Failed to update backpack:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCurrenciesChange = async (newCurrencies: typeof character.currencies) => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_CURRENCIES',
        payload: newCurrencies,
      })
    } catch (error) {
      console.error('Failed to update currencies:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUseConsumable = async (item: EquipmentItem, source: 'equipped' | 'backpack', slotKey: string) => {
    setIsUpdating(true)
    try {
      if (source === 'equipped') {
        const newEquipped = { ...character.equippedItems }
        if (item.quantity && item.quantity > 1) {
          newEquipped[slotKey as keyof typeof newEquipped] = { ...item, quantity: item.quantity - 1 }
        } else {
          newEquipped[slotKey as keyof typeof newEquipped] = null
        }
        await optimisticDispatch({ type: 'UPDATE_EQUIPPED_ITEMS', payload: newEquipped })
      } else {
        const newBackpack = [...character.backpack]
        const index = parseInt(slotKey)
        if (item.quantity && item.quantity > 1) {
          newBackpack[index] = { ...item, quantity: item.quantity - 1 }
        } else {
          newBackpack[index] = null
        }
        await optimisticDispatch({ type: 'UPDATE_BACKPACK', payload: newBackpack })
      }

      const consumableEffects = item.effects?.filter(e => e.type === 'consumable') || []
      const newEffects: ActiveEffect[] = consumableEffects.map(effect => ({
        id: `effect-${Date.now()}-${effect.id}`,
        name: effect.name,
        description: effect.description,
        source: item.name,
        type: 'consumable' as const,
        duration: 'até descansar',
        modifiers: effect.passiveModifiers,
      }))
      setActiveEffects(prev => [...prev, ...newEffects])
    } catch (error) {
      console.error('Failed to use consumable:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClearEffect = (effectId: string) => {
    setActiveEffects(prev => prev.filter(e => e.id !== effectId))
  }

  const handleClearEffectsByDuration = (duration: string) => {
    setActiveEffects(prev => prev.filter(e => (e.duration || 'permanente') !== duration))
  }

  const handleClearAllEffects = () => {
    setActiveEffects([])
  }

  const handleAddActiveEffect = (effect: {
    name: string
    description: string
    source: string
    type: 'active' | 'consumable'
    duration?: string
    consumeOnAttack?: boolean
  }) => {
    const newEffect: ActiveEffect = {
      id: `effect-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: effect.name,
      description: effect.description,
      source: effect.source,
      type: effect.type,
      duration: effect.duration,
      consumeOnAttack: effect.consumeOnAttack,
    }
    setActiveEffects(prev => [...prev, newEffect])
  }

  const handleCombatAction = (description: string, actionCost: string, execute: () => void) => {
    if (!character.inCombat) {
      execute()
      return
    }
    setPendingCombatConfirmation({ description, actionCost, execute })
  }

  const handleConfirmCombatAction = async () => {
    if (!pendingCombatConfirmation) return
    const { actionCost, execute } = pendingCombatConfirmation
    if (actionCost !== 'free') {
      const currentAmount = character.availableActions[actionCost as keyof typeof character.availableActions] || 0
      if (currentAmount > 0) {
        await optimisticDispatch({
          type: 'UPDATE_AVAILABLE_ACTIONS',
          payload: { [actionCost]: currentAmount - 1 },
        })
      }
    }
    execute()
    setPendingCombatConfirmation(null)
  }

  // Combat tab handlers
  const handleRollInitiative = async (result: number) => {
    console.log('🎲 handleRollInitiative called with:', result)
    console.log('📊 Current initiative:', character.initiativeRoll)
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_INITIATIVE_ROLL',
        payload: result,
      })
      console.log('✅ Initiative dispatch completed')
    } catch (error) {
      console.error('❌ Failed to update initiative:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStartTurn = async () => {
    setIsUpdating(true)
    try {
      // Reset usedThisTurn for all actions
      const resetActions = character.actionsList.map(a => ({
        ...a,
        usedThisTurn: 0,
      }))
      await optimisticDispatch({ type: 'UPDATE_ACTIONS_LIST', payload: resetActions })
      await optimisticDispatch({ type: 'START_TURN' })

      // Process active effect durations
      setActiveEffects(prev =>
        prev
          .map(effect => {
            const duration = effect.duration || ''
            const turnMatch = duration.match(/^(\d+)\s*turno(s)?$/)
            if (turnMatch) {
              const turns = parseInt(turnMatch[1])
              if (turns <= 1) return null
              return { ...effect, duration: turns - 1 === 1 ? '1 turno' : `${turns - 1} turnos` }
            }
            return effect
          })
          .filter((effect): effect is ActiveEffect => effect !== null)
      )
    } catch (error) {
      console.error('Failed to start turn:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleCombat = async () => {
    setIsUpdating(true)
    try {
      const newCombatState = !character.inCombat
      await optimisticDispatch({
        type: 'TOGGLE_COMBAT',
        payload: newCombatState,
      })

      // If ending combat, reset available actions
      if (!newCombatState) {
        await optimisticDispatch({
          type: 'RESET_ACTIONS',
        })
      }
    } catch (error) {
      console.error('Failed to toggle combat:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUseAction = async (action: CombatAction) => {
    // Se a ação tem escolhas, abrir o modal
    if (action.modal && action.choices && action.choices.length > 0) {
      setPendingAction(action)
      setChoiceModalOpen(true)
      return
    }

    // Executar a ação normalmente
    await executeAction(action)
  }

  const handleChoiceSelect = async (choice: string) => {
    if (!pendingAction) return

    // Adicionar a ação escolhida
    const actionType = choice as keyof AvailableActions
    const currentAmount = character.availableActions[actionType] || 0
    await optimisticDispatch({
      type: 'UPDATE_AVAILABLE_ACTIONS',
      payload: { [actionType]: currentAmount + 1 },
    })

    // Executar a ação (deduct costs e incrementar uso)
    await executeAction(pendingAction)

    setPendingAction(null)
  }

  const executeAction = async (action: CombatAction) => {
    setIsUpdating(true)
    try {
      // Deduct action costs (movimento, padrão, etc.)
      if (action.type && action.type !== 'other') {
        const currentAmount = character.availableActions[action.type] || 0
        if (currentAmount > 0) {
          await optimisticDispatch({
            type: 'UPDATE_AVAILABLE_ACTIONS',
            payload: { [action.type]: currentAmount - 1 },
          })
        }
      }

      // Deduct costs
      if (action.cost?.pv) {
        await optimisticDispatch({
          type: 'UPDATE_HEALTH',
          payload: character.health - action.cost.pv,
        })
      }
      if (action.cost?.pm) {
        await optimisticDispatch({
          type: 'UPDATE_MANA',
          payload: character.mana - action.cost.pm,
        })
      }

      // Increment usedThisTurn
      if (action.usesPerTurn !== undefined) {
        const updatedActions = character.actionsList.map(a =>
          a.id === action.id
            ? { ...a, usedThisTurn: (a.usedThisTurn || 0) + 1 }
            : a
        )
        await optimisticDispatch({
          type: 'UPDATE_ACTIONS_LIST',
          payload: updatedActions,
        })
      }
    } catch (error) {
      console.error('Failed to use action:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleFavoriteAction = async (actionId: string) => {
    const updatedActions = character.actionsList.map(a =>
      a.id === actionId ? { ...a, isFavorite: !a.isFavorite } : a
    )
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_ACTIONS_LIST',
        payload: updatedActions,
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddWeapon = async (weapon: Omit<WeaponAttack, 'id'>) => {
    const newWeapon = { ...weapon, id: `weapon-${Date.now()}` }
    const updatedWeapons = [...character.weapons, newWeapon]
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_WEAPONS',
        payload: updatedWeapons,
      })
    } catch (error) {
      console.error('Failed to add weapon:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveWeapon = async (weaponId: string) => {
    const updatedWeapons = character.weapons.filter(w => w.id !== weaponId)
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_WEAPONS',
        payload: updatedWeapons,
      })
    } catch (error) {
      console.error('Failed to remove weapon:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleFavoriteWeapon = async (weaponId: string) => {
    const updatedWeapons = character.weapons.map(w =>
      w.id === weaponId ? { ...w, isFavorite: !w.isFavorite } : w
    )
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_WEAPONS',
        payload: updatedWeapons,
      })
    } catch (error) {
      console.error('Failed to toggle favorite weapon:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateWeapon = async (weaponId: string, weaponData: Omit<WeaponAttack, 'id' | 'isFavorite'>) => {
    const updatedWeapons = character.weapons.map(w =>
      w.id === weaponId ? { ...w, ...weaponData } : w
    )
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_WEAPONS',
        payload: updatedWeapons,
      })
    } catch (error) {
      console.error('Failed to update weapon:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUseWeapon = async (weapon: WeaponAttack) => {
    setIsUpdating(true)
    try {
      // Consume standard action
      const currentStandard = character.availableActions.standard || 0
      if (currentStandard > 0) {
        await optimisticDispatch({
          type: 'UPDATE_AVAILABLE_ACTIONS',
          payload: { standard: currentStandard - 1 },
        })
      }

      // Get attribute modifier
      const attribute = character.attributes.find(attr => attr.label === weapon.attackAttribute)
      const attributeModifier = attribute ? attribute.modifier : 0
      const totalAttackBonus = attributeModifier + weapon.attackBonus

      // Roll attack: d20 + attribute modifier + attack bonus
      addRoll(`Ataque: ${weapon.name}`, totalAttackBonus, 20)

      // Remove effects that are consumed on attack
      setActiveEffects(prev => prev.filter(e => !e.consumeOnAttack))
    } catch (error) {
      console.error('Failed to use weapon:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRollDamage = (weapon: WeaponAttack) => {
    // Get attribute modifier
    const attribute = character.attributes.find(attr => attr.label === weapon.attackAttribute)
    const attributeModifier = attribute ? attribute.modifier : 0

    // Parse and roll damage
    // Expected format: "1d8+3" or "2d6" or "1d10+5"
    const damageMatch = weapon.damage.match(/(\d+)d(\d+)([+\-]\d+)?/)
    if (damageMatch) {
      const numDice = parseInt(damageMatch[1])
      const diceSize = parseInt(damageMatch[2])
      const flatModifier = damageMatch[3] ? parseInt(damageMatch[3]) : 0

      // Roll each die using addRoll
      let damageTotal = flatModifier + attributeModifier
      for (let i = 0; i < numDice; i++) {
        const { total } = addRoll(`Dano: ${weapon.name}`, 0, diceSize)
        damageTotal += total
      }

      console.log(`💥 Dano total: ${damageTotal}`)
    }
  }

  const handleReorderFavorites = async (newWeapons: WeaponAttack[], newActions: CombatAction[], newAbilities?: Ability[]) => {
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_WEAPONS',
        payload: newWeapons,
      })
      await optimisticDispatch({
        type: 'UPDATE_ACTIONS_LIST',
        payload: newActions,
      })
      if (newAbilities) {
        await optimisticDispatch({
          type: 'UPDATE_ABILITIES',
          payload: newAbilities,
        })
      }
    } catch (error) {
      console.error('Failed to reorder favorites:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleFavoriteAbility = async (abilityId: string) => {
    const updatedAbilities = (character.abilities || []).map(a =>
      a.id === abilityId ? { ...a, isFavorite: !a.isFavorite } : a
    )
    setIsUpdating(true)
    try {
      await optimisticDispatch({
        type: 'UPDATE_ABILITIES',
        payload: updatedAbilities,
      })
    } catch (error) {
      console.error('Failed to toggle favorite ability:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUseAbility = async (ability: Ability) => {
    setIsUpdating(true)
    try {
      // Consume action based on ability type
      if (ability.actionType && ability.actionType !== 'free') {
        const currentAmount = character.availableActions[ability.actionType as keyof typeof character.availableActions] || 0
        if (currentAmount > 0) {
          await optimisticDispatch({
            type: 'UPDATE_AVAILABLE_ACTIONS',
            payload: { [ability.actionType]: currentAmount - 1 },
          })
        }
      }

      // Deduct costs
      if (ability.cost?.pv) {
        await optimisticDispatch({
          type: 'UPDATE_HEALTH',
          payload: character.health - ability.cost.pv,
        })
      }
      if (ability.cost?.pm) {
        await optimisticDispatch({
          type: 'UPDATE_MANA',
          payload: character.mana - ability.cost.pm,
        })
      }

      // Add active effect
      handleAddActiveEffect({
        name: ability.name,
        description: ability.description,
        source: ability.source || 'Habilidade',
        type: 'active',
        duration: ability.usesPerDay !== undefined ? 'até descansar' : undefined,
      })
    } catch (error) {
      console.error('Failed to use ability:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const navItemsMobile = [
    { id: 'summary', label: 'Resumo' },
    { id: 'combat', label: 'Combate' },
    { id: 'abilities', label: 'Habilidades' },
    { id: 'inventory', label: 'Inventário' },
    { id: 'other', label: 'Outros' },
  ]

  const navItemsDesktop = [
    { id: 'combat', label: 'Combate' },
    { id: 'abilities', label: 'Habilidades' },
    { id: 'inventory', label: 'Inventário' },
    { id: 'other', label: 'Outros' },
  ]

  return (
    <div className="w-full md:max-w-none h-[100dvh] bg-bg flex flex-col relative">
      <TopBar onAllCharacters={onBackToCharacters} />

      <CharacterHeader
        name={character.name}
        imageUrl={character.imageUrl}
        classes={character.classes}
        origin={character.origin}
        deity={character.deity}
        onSettings={() => console.log('Settings')}
      />

      <DiceRollDisplay />

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-bg bg-opacity-50 flex items-center justify-center z-[90] pointer-events-none">
          <div className="bg-card border border-stroke rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Salvando...</span>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 md:pt-[1vh] md:pb-2 transition-opacity overflow-y-auto min-h-0 ${isDead ? 'opacity-40 pointer-events-none' : ''}`} style={{ height: '-webkit-fill-available' }}>
        {/* MOBILE: Single column view */}
        <div className="md:hidden px-[2vw] py-[1vh] ">
        {/* RESUMO TAB */}
        {activeNav === 'summary' && (
          <SummaryTab
            character={character}
            senses={senses}
            proficiencies={proficiencies}
            onHealthChange={handleHealthChange}
            onManaChange={handleManaChange}
            onSkillsChange={handleSkillsChange}
            onBleedingRoll={handleBleedingRoll}
            onConRoll={handleConRoll}
            onRollInitiative={handleRollInitiative}
            onSwitchToCombat={() => setActiveNav('combat')}
            onSensesChange={setSenses}
            onProficienciesChange={setProficiencies}
            onEquippedItemsChange={handleEquippedItemsChange}
            onBackpackChange={handleBackpackChange}
            onCurrenciesChange={handleCurrenciesChange}
            onUseConsumable={handleUseConsumable}
            activeEffects={activeEffects}
            onClearEffect={handleClearEffect}
            onClearEffectsByDuration={handleClearEffectsByDuration}
            onClearAllEffects={handleClearAllEffects}
            onCombatAction={handleCombatAction}
          />
        )}

        {/* COMBATE TAB */}
        {activeNav === 'combat' && (
          <CombatTab
            character={character}
            weaponModalOpen={weaponModalOpen}
            choiceModalOpen={choiceModalOpen}
            pendingAction={pendingAction}
            onHealthChange={handleHealthChange}
            onManaChange={handleManaChange}
            onBleedingRoll={handleBleedingRoll}
            onConRoll={handleConRoll}
            onStartTurn={handleStartTurn}
            onRollInitiative={handleRollInitiative}
            onToggleCombat={handleToggleCombat}
            onSkillsChange={handleSkillsChange}
            onUseAction={handleUseAction}
            onUseWeapon={handleUseWeapon}
            onUseAbility={handleUseAbility}
            onRollDamage={handleRollDamage}
            onReorderFavorites={handleReorderFavorites}
            onToggleFavoriteAction={handleToggleFavoriteAction}
            onToggleFavoriteAbility={handleToggleFavoriteAbility}
            onSetWeaponModalOpen={setWeaponModalOpen}
            onAddWeapon={handleAddWeapon}
            onUpdateWeapon={handleUpdateWeapon}
            onRemoveWeapon={handleRemoveWeapon}
            onToggleFavoriteWeapon={handleToggleFavoriteWeapon}
            onSetChoiceModalOpen={setChoiceModalOpen}
            onChoiceSelect={handleChoiceSelect}
          />
        )}

        {/* HABILIDADES TAB */}
        {activeNav === 'abilities' && (
          <AbilitiesTab
            character={character}
            onAddActiveEffect={handleAddActiveEffect}
          />
        )}

        {/* INVENTÁRIO TAB */}
        {activeNav === 'inventory' && (
          <InventoryTab
            character={character}
            onBackpackChange={handleBackpackChange}
            onEquippedItemsChange={handleEquippedItemsChange}
            onCurrenciesChange={handleCurrenciesChange}
            onUseConsumable={handleUseConsumable}
            onCombatAction={handleCombatAction}
          />
        )}

        {/* OUTROS TAB */}
        {activeNav === 'other' && (
          <OtherTab
            character={character}
            onResistancesChange={handleResistancesChange}
          />
        )}
        </div>

        {/* DESKTOP/TABLET: Two column view */}
        <DesktopView
          character={character}
          senses={senses}
          proficiencies={proficiencies}
          activeNavDesktop={activeNavDesktop}
          navItemsDesktop={navItemsDesktop}
          weaponModalOpen={weaponModalOpen}
          choiceModalOpen={choiceModalOpen}
          pendingAction={pendingAction}
          onHealthChange={handleHealthChange}
          onManaChange={handleManaChange}
          onSkillsChange={handleSkillsChange}
          onBleedingRoll={handleBleedingRoll}
          onConRoll={handleConRoll}
          onRollInitiative={handleRollInitiative}
          onToggleCombat={handleToggleCombat}
          onSwitchToCombat={() => setActiveNav('combat')}
          onSensesChange={setSenses}
          onProficienciesChange={setProficiencies}
          onEquippedItemsChange={handleEquippedItemsChange}
          onBackpackChange={handleBackpackChange}
          onCurrenciesChange={handleCurrenciesChange}
          onResistancesChange={handleResistancesChange}
          onNavChange={setActiveNav}
          onStartTurn={handleStartTurn}
          onUseAction={handleUseAction}
          onUseWeapon={handleUseWeapon}
          onUseAbility={handleUseAbility}
          onRollDamage={handleRollDamage}
          onReorderFavorites={handleReorderFavorites}
          onToggleFavoriteAction={handleToggleFavoriteAction}
          onToggleFavoriteAbility={handleToggleFavoriteAbility}
          onSetWeaponModalOpen={setWeaponModalOpen}
          onAddWeapon={handleAddWeapon}
          onUpdateWeapon={handleUpdateWeapon}
          onRemoveWeapon={handleRemoveWeapon}
          onToggleFavoriteWeapon={handleToggleFavoriteWeapon}
          onSetChoiceModalOpen={setChoiceModalOpen}
          onChoiceSelect={handleChoiceSelect}
          onUseConsumable={handleUseConsumable}
          activeEffects={activeEffects}
          onClearEffect={handleClearEffect}
          onClearEffectsByDuration={handleClearEffectsByDuration}
          onClearAllEffects={handleClearAllEffects}
          onCombatAction={handleCombatAction}
          onAddActiveEffect={handleAddActiveEffect}
        />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNavigation
          items={navItemsMobile}
          activeItem={activeNav}
          onItemChange={setActiveNav}
          isFixed={false}
        />
      </div>

      {/* Combat Confirmation Modal */}
      <Modal
        isOpen={pendingCombatConfirmation !== null}
        onClose={() => setPendingCombatConfirmation(null)}
        title="Confirmação de Ação"
      >
        {pendingCombatConfirmation && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted">Você está em combate.</p>
              <p className="text-sm mt-1">{pendingCombatConfirmation.description}</p>
              <p className="text-sm font-semibold text-yellow-400 mt-2">
                Custo: {ACTION_COST_LABELS[pendingCombatConfirmation.actionCost] || pendingCombatConfirmation.actionCost}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmCombatAction}
                className="flex-1 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors text-sm font-semibold"
              >
                Prosseguir
              </button>
              <button
                onClick={() => setPendingCombatConfirmation(null)}
                className="flex-1 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Resurrection Overlay */}
      {isDead && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-card border-2 border-red-600 rounded-lg p-6 shadow-2xl text-center">
            <div className="text-2xl font-bold text-red-600 mb-4">Você Morreu</div>
            <div className="text-sm font-bold mb-4">A aventura terminou... Ou será que não?</div>
            <button
              onClick={handleResurrect}
              disabled={isUpdating}
              className="px-6 py-3 bg-accent text-card rounded-lg hover:bg-accent-hover transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Ressuscitando...' : 'Ressuscitar?'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

type CharacterSheetProps = {
  onBackToCharacters?: () => void
}

const CharacterSheet = ({ onBackToCharacters }: CharacterSheetProps) => (
  <DiceRollProvider>
    <CharacterSheetInner onBackToCharacters={onBackToCharacters} />
  </DiceRollProvider>
)

export default CharacterSheet
