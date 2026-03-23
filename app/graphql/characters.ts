const EQUIPMENT_ITEM_FIELDS = `
  id name description quantity weight spaces price category
  twoHanded versatile usingTwoHanded allowedSlots
  effects {
    id name description type
    passiveModifiers {
      attribute { label bonus }
      defense { type bonus }
      resistance { type bonus }
      skill { name bonus }
      other { label value }
    }
    activeAbility { name description actionType cost { pm pv } usesPerDay consumeItem }
  }
`

export const GET_CHARACTER_QUERY = `
  query GetCharacter($id: ID!) {
    character(id: $id) {
      id name imageUrl
      classes { name level tooltip }
      origin { name tooltip }
      deity { name tooltip }

      health maxHealth mana maxMana size sizeTooltip movement movementTooltip proficiencyBonus spellSaveDc spellcastingAttribute spellDcNotes spellDcTooltip

      attributes { label value modifier visible }
      resistances { name value tooltip visible }
      defenses { name value tooltip }
      senses { name value tooltip visible }
      proficiencies { name tooltip }

      inCombat initiativeRoll isMyTurn turnOrder
      availableActions { standard movement free full reaction }

      actionsList {
        id name type effect tooltip modal choices resistance
        isFavorite favoriteOrder usesPerTurn usedThisTurn
        cost { pm pv }
      }

      weapons {
        id name damage damageType attackBonus attackAttribute
        critRange critMultiplier range actionType
        isFavorite favoriteOrder equipmentId
      }

      skills {
        name modifier trained attribute tooltip
        visibleInCombat visibleInSummary
        levelBonus trainingBonus
        otherBonuses { label value }
      }

      abilities {
        id name description type actionType source
        isFavorite favoriteOrder usesPerDay
        cost { pm pv }
      }

      spells {
        id name type circle school execution executionDetails
        range duration durationDetails resistance extraCosts description
        target { amount upTo type }
        areaEffect areaEffectDetails counterspell
        enhancements {
          cost type description
          extraDetails { execution duration circle effects { type attribute amount } }
        }
        effects { type attribute amount resistanceRequirement extraRequirements }
        isFavorite favoriteOrder
      }

      equippedItems {
        rightHand { ${EQUIPMENT_ITEM_FIELDS} }
        leftHand   { ${EQUIPMENT_ITEM_FIELDS} }
        quickDraw1 { ${EQUIPMENT_ITEM_FIELDS} }
        quickDraw2 { ${EQUIPMENT_ITEM_FIELDS} }
        slot1 { ${EQUIPMENT_ITEM_FIELDS} }
        slot2 { ${EQUIPMENT_ITEM_FIELDS} }
        slot3 { ${EQUIPMENT_ITEM_FIELDS} }
        slot4 { ${EQUIPMENT_ITEM_FIELDS} }
      }

      backpack { ${EQUIPMENT_ITEM_FIELDS} }
      currencies { tc tp to }
      notes

      updatedAt version
    }
  }
`

export const LEVEL_UP_CHARACTER_MUTATION = `
  mutation LevelUpCharacter($id: ID!, $input: LevelUpCharacterInput!) {
    levelUpCharacter(id: $id, input: $input) {
      character { id version }
      errors
    }
  }
`

export const GET_CLASS_POWERS_FOR_LEVEL_QUERY = `
  query ClassPowersForLevel($classKey: String!, $level: Int!, $characterId: ID) {
    classPowersForLevel(classKey: $classKey, level: $level, characterId: $characterId) {
      powerChoices
      fixedAbilities
      selectablePowers { id name description type cost { pm pv } source }
    }
  }
`

export const UPDATE_CHARACTER_HIDDEN_SENSES_MUTATION = `
  mutation UpdateCharacterHiddenSenses($id: ID!, $hiddenSenseNames: [String!]!) {
    updateCharacterHiddenSenses(id: $id, hiddenSenseNames: $hiddenSenseNames) {
      character { id }
      errors
    }
  }
`

export const UPDATE_CHARACTER_HEALTH_MUTATION = `
  mutation UpdateCharacterHealth($id: ID!, $health: Int!) {
    updateCharacterHealth(id: $id, health: $health) {
      character { id health }
      errors
    }
  }
`

export const UPDATE_CHARACTER_MANA_MUTATION = `
  mutation UpdateCharacterMana($id: ID!, $mana: Int!) {
    updateCharacterMana(id: $id, mana: $mana) {
      character { id mana }
      errors
    }
  }
`

export const UPDATE_CHARACTER_CURRENCIES_MUTATION = `
  mutation UpdateCharacterCurrencies($id: ID!, $currencies: CurrenciesInput!) {
    updateCharacterCurrencies(id: $id, currencies: $currencies) {
      character { id currencies { tc tp to } }
      errors
    }
  }
`

export const GET_CHARACTERS_QUERY = `
  query GetCharacters {
    characters {
      id
      name
      imageUrl
      level
      classes {
        name
        level
      }
    }
  }
`

export const UPDATE_CHARACTER_EQUIPMENT_MUTATION = `
  mutation UpdateCharacterEquipment($id: ID!, $equippedItems: EquippedItemsInput!, $backpack: [EquipmentItemInput!]!) {
    updateCharacterEquipment(id: $id, equippedItems: $equippedItems, backpack: $backpack) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_ATTRIBUTES_MUTATION = `
  mutation UpdateCharacterAttributes($id: ID!, $attributes: [AttributeInput!]!) {
    updateCharacterAttributes(id: $id, attributes: $attributes) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_RESISTANCES_MUTATION = `
  mutation UpdateCharacterResistances($id: ID!, $resistances: [ResistanceInput!]!) {
    updateCharacterResistances(id: $id, resistances: $resistances) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_SKILLS_MUTATION = `
  mutation UpdateCharacterSkills($id: ID!, $skills: [SkillInput!]!) {
    updateCharacterSkills(id: $id, skills: $skills) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_WEAPONS_MUTATION = `
  mutation UpdateCharacterWeapons($id: ID!, $weapons: [WeaponAttackInput!]!) {
    updateCharacterWeapons(id: $id, weapons: $weapons) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_ACTIONS_LIST_MUTATION = `
  mutation UpdateCharacterActionsList($id: ID!, $actionsList: [CombatActionInput!]!) {
    updateCharacterActionsList(id: $id, actionsList: $actionsList) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_ABILITIES_MUTATION = `
  mutation UpdateCharacterAbilities($id: ID!, $abilities: [AbilityInput!]!) {
    updateCharacterAbilities(id: $id, abilities: $abilities) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_SPELLS_MUTATION = `
  mutation UpdateCharacterSpells($id: ID!, $spells: [SpellInput!]!) {
    updateCharacterSpells(id: $id, spells: $spells) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_AVAILABLE_ACTIONS_MUTATION = `
  mutation UpdateCharacterAvailableActions($id: ID!, $availableActions: AvailableActionsInput!) {
    updateCharacterAvailableActions(id: $id, availableActions: $availableActions) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_INITIATIVE_ROLL_MUTATION = `
  mutation UpdateCharacterInitiativeRoll($id: ID!, $initiativeRoll: Int) {
    updateCharacterInitiativeRoll(id: $id, initiativeRoll: $initiativeRoll) {
      character { id version }
      errors
    }
  }
`

export const UPDATE_CHARACTER_NOTES_MUTATION = `
  mutation UpdateCharacterNotes($id: ID!, $notes: JSON!) {
    updateCharacterNotes(id: $id, notes: $notes) {
      character { id version }
      errors
    }
  }
`

export const CREATE_CHARACTER_MUTATION = `
  mutation CreateCharacter($input: CreateCharacterInput!) {
    createCharacter(input: $input) {
      character { id }
      errors
    }
  }
`

export const WIZARD_DATA_QUERY = `
  query WizardData {
    rulebook {
      racas { id name description size movement attributeBonuses racialAbilities chosenAbilitiesAmount availableChosenAbilities choices }
      classes { id name hitPoints manaPoints skills proficiencies abilities spellcasting choices progression }
      origens { id name description benefits uniquePower choices items }
      divindades { id name title description energy preferredWeapon grantedPowers obligationsRestrictions beliefsObjectives }
      racialPowers: poderes(kind: "habilidade_de_raca") { id name description effects }
      classPowers: poderes(kind: "poder_classe") { id name description }
      deityPowers: poderes(kind: "poder_concedido") { id name description effects }
      generalPowers: poderes(kind: "poder_geral") { id name description prerequisites }
      tormentaPowers: poderes(kind: "poder_tormenta") { id name description prerequisites }
      simpleWeapons: armas(category: "simples") { id name damage damageType critical range }
      martialWeapons: armas(category: "marciais") { id name damage damageType critical range }
    }
  }
`

