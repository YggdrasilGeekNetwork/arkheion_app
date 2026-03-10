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
