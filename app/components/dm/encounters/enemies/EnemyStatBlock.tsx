import type { Creature } from '~/types/encounter'

type EnemyStatBlockProps = {
  creature: Creature
}

const ATTR_LABELS = [
  { key: 'for', label: 'FOR' },
  { key: 'des', label: 'DES' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'sab', label: 'SAB' },
  { key: 'car', label: 'CAR' },
] as const

function mod(val: number) {
  const m = Math.floor((val - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

export default function EnemyStatBlock({ creature }: EnemyStatBlockProps) {
  return (
    <div className="space-y-2 text-[10px]">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold text-fg">{creature.name}</span>
        <span className="text-muted">
          {creature.size} {creature.type} · ND {creature.nd}
        </span>
      </div>

      <div className="border-t border-stroke/50 pt-1.5 space-y-1.5">
        {/* Defesas */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          <span><strong className="text-accent">CA</strong> {creature.ca}</span>
          <span><strong className="text-red-400">PV</strong> {creature.pv}</span>
          <span><strong className="text-muted">Desl.</strong> {creature.deslocamento}</span>
        </div>

        {/* Atributos */}
        <div className="grid grid-cols-6 gap-1">
          {ATTR_LABELS.map(({ key, label }) => (
            <div key={key} className="text-center bg-surface rounded px-1 py-0.5">
              <div className="text-muted text-[8px]">{label}</div>
              <div className="font-medium">{creature.attributes[key]}</div>
              <div className="text-muted text-[8px]">{mod(creature.attributes[key])}</div>
            </div>
          ))}
        </div>

        {/* Resistências */}
        <div className="flex gap-3">
          <span><strong className="text-green-400">Fort</strong> +{creature.resistances.fortitude}</span>
          <span><strong className="text-blue-400">Refl</strong> +{creature.resistances.reflexos}</span>
          <span><strong className="text-purple-400">Von</strong> +{creature.resistances.vontade}</span>
        </div>

        {/* Ataques */}
        {creature.attacks.length > 0 && (
          <div>
            <div className="font-semibold text-red-400 mb-0.5">Ataques</div>
            {creature.attacks.map((atk, i) => (
              <div key={i} className="ml-1">
                <span className="font-medium">{atk.name}</span>{' '}
                <span className="text-accent">+{atk.bonus}</span>{' '}
                <span className="text-muted">({atk.damage}{atk.type ? ` ${atk.type}` : ''}{atk.extra ? `, ${atk.extra}` : ''})</span>
              </div>
            ))}
          </div>
        )}

        {/* Habilidades */}
        {creature.abilities && creature.abilities.length > 0 && (
          <div>
            <div className="font-semibold text-amber-400 mb-0.5">Habilidades</div>
            <div className="ml-1 text-muted leading-relaxed">
              {creature.abilities.join('; ')}
            </div>
          </div>
        )}

        {/* Sentidos / Tesouro */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted">
          {creature.senses && <span><strong className="text-fg">Sentidos:</strong> {creature.senses}</span>}
          {creature.treasure && <span><strong className="text-fg">Tesouro:</strong> {creature.treasure}</span>}
        </div>
      </div>
    </div>
  )
}
