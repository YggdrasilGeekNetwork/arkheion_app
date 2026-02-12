import type { Character } from '~/types/character'
import type { CharacterSnapshotData } from '~/types/mesa'
import { getTotalLevel } from '~/utils/tormenta20'

export function extractSnapshotData(character: Character): CharacterSnapshotData {
  const getAttributeData = (label: string) => {
    const attr = character.attributes.find(a => a.label === label)
    return { value: attr?.value ?? 10, modifier: attr?.modifier ?? 0 }
  }

  const getResistanceValue = (name: string) => {
    const res = character.resistances.find(r => r.name === name)
    return res?.value ?? 0
  }

  const getDefenseValue = (name: string) => {
    const def = character.defenses.find(d => d.name === name)
    return def?.value ?? 10
  }

  return {
    id: character.id,
    name: character.name,
    imageUrl: character.imageUrl,
    level: getTotalLevel(character.classes),
    ca: getDefenseValue('CA'),
    health: {
      current: character.health,
      max: character.maxHealth,
    },
    mana: {
      current: character.mana,
      max: character.maxMana,
    },
    resistances: {
      fortitude: getResistanceValue('Fortitude'),
      reflexos: getResistanceValue('Reflexos'),
      vontade: getResistanceValue('Vontade'),
    },
    attributes: {
      FOR: getAttributeData('FOR'),
      DES: getAttributeData('DES'),
      CON: getAttributeData('CON'),
      INT: getAttributeData('INT'),
      SAB: getAttributeData('SAB'),
      CAR: getAttributeData('CAR'),
    },
  }
}

export function getHealthPercentage(current: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, Math.min(100, (current / max) * 100))
}

export function getHealthColorClass(current: number, max: number): string {
  const percentage = getHealthPercentage(current, max)
  if (percentage <= 0) return 'bg-gray-600'
  if (percentage <= 25) return 'bg-red-500'
  if (percentage <= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function getManaColorClass(): string {
  return 'bg-blue-500'
}
