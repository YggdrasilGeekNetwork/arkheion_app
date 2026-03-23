import type { PowerPrerequisite, AttributeValues, PendingChoice } from '~/types/wizard'

const ATTR_MAP: Record<string, keyof AttributeValues> = {
  sab: 'SAB', des: 'DES', int: 'INT', car: 'CAR', for: 'FOR', forca: 'FOR', con: 'CON',
}

const LEVEL_TYPES = new Set(['character_level', 'character_lvl', 'level', 'lvl_de_personagem'])

export function checkPowerEligibility(
  prerequisites: PowerPrerequisite[] | undefined,
  attributes: AttributeValues,
  racialBonuses: Array<{ attribute: string; value: number }>,
  totalLevel: number,
): { eligible: boolean; reason?: string } {
  if (!prerequisites || prerequisites.length === 0) return { eligible: true }

  for (const req of prerequisites) {
    if (req.sub_type !== 'hard') continue

    if (req.type === 'attr_value' && req.attr != null && req.value != null) {
      const minMod = Math.floor((req.value - 10) / 2)
      const attrs = Array.isArray(req.attr) ? req.attr : [req.attr]
      const attrKeys = attrs.map(a => ATTR_MAP[a]).filter((k): k is keyof AttributeValues => !!k)

      const anyMeets = attrKeys.some(key => {
        const base = attributes[key] ?? 0
        const racial = racialBonuses.find(b => b.attribute === key)?.value ?? 0
        return base + racial >= minMod
      })

      if (!anyMeets && attrKeys.length > 0) {
        const label = attrKeys.join(' ou ')
        const sign = minMod >= 0 ? '+' : ''
        return { eligible: false, reason: `Requer ${label} ${req.value} (mod ${sign}${minMod})` }
      }
    }

    if (LEVEL_TYPES.has(req.type) && req.value != null && totalLevel < req.value) {
      return { eligible: false, reason: `Requer nível ${req.value}` }
    }
  }

  return { eligible: true }
}

/** Builds the ineligibleOptionsByChoice map for InlineChoiceResolver */
export function buildIneligiblePowerOptions(
  choices: PendingChoice[],
  attributes: AttributeValues,
  racialBonuses: Array<{ attribute: string; value: number }>,
  totalLevel: number,
): Map<string, Map<string, string>> | undefined {
  const map = new Map<string, Map<string, string>>()
  for (const choice of choices) {
    if (!choice.availablePowers) continue
    const inner = new Map<string, string>()
    for (const power of choice.availablePowers) {
      const { eligible, reason } = checkPowerEligibility(power.prerequisites, attributes, racialBonuses, totalLevel)
      if (!eligible && reason) inner.set(String(power.id), reason)
    }
    if (inner.size > 0) map.set(choice.id, inner)
  }
  return map.size > 0 ? map : undefined
}
