import { useState } from 'react'
import type {
  AggregatedData, CardSection, GroupedEnemy, GroupedNPC, GroupedObject,
  AggregatedRewards, EncounterPath,
} from '../utils/hierarchyHelpers'

type HierarchySummaryProps = {
  data: AggregatedData
  onNavigate: (path: EncounterPath) => void
}

type CollapsibleSectionProps = {
  icon: string
  label: string
  count: number
  children: React.ReactNode
}

function CollapsibleSection({ icon, label, count, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-stroke rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left
          hover:bg-bg/50 transition-colors"
      >
        <span className="text-[10px] text-muted">{open ? '▾' : '▸'}</span>
        <span className="text-xs">{icon}</span>
        <span className="text-[11px] font-medium text-fg flex-1">{label}</span>
        <span className="text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded-full">{count}</span>
      </button>
      {open && (
        <div className="border-t border-stroke/50 px-2 py-1.5 space-y-1 bg-bg/30">
          {children}
        </div>
      )}
    </div>
  )
}

function EncounterLink({ path, onNavigate }: { path: EncounterPath; onNavigate: (p: EncounterPath) => void }) {
  return (
    <button
      onClick={() => onNavigate(path)}
      className="text-accent/70 hover:text-accent hover:underline transition-colors"
    >
      {path.encounterName}
    </button>
  )
}

function EnemySection({
  enemies,
  total,
  onNavigate,
}: {
  enemies: GroupedEnemy[]
  total: number
  onNavigate: (p: EncounterPath) => void
}) {
  return (
    <CollapsibleSection icon="👹" label="Inimigos" count={total}>
      {enemies.map(e => (
        <div key={e.creatureId} className="text-[10px] py-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-fg font-medium">{e.name}</span>
              {e.count > 1 && (
                <span className="text-accent font-mono">x{e.count}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted">
              <span>ND {e.nd}</span>
              <span className="text-muted/60">{e.type}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-0.5 ml-1">
            <span className="text-muted/50">-&gt;</span>
            <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
              {e.paths.map(p => (
                <EncounterLink key={p.encounterId} path={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </CollapsibleSection>
  )
}

function NPCSection({
  npcs,
  onNavigate,
}: {
  npcs: GroupedNPC[]
  onNavigate: (p: EncounterPath) => void
}) {
  return (
    <CollapsibleSection icon="👤" label="NPCs" count={npcs.length}>
      {npcs.map(n => (
        <div key={n.npcId} className="text-[10px] py-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-fg font-medium">{n.name}</span>
              {n.title && <span className="text-muted italic">{n.title}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] px-1 py-0.5 rounded ${
                n.alignment === 'Aliado' ? 'text-green-400' :
                n.alignment === 'Inimigo' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {n.alignment}
              </span>
              {n.isCombatant && <span className="text-[9px] text-amber-400">⚔️</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-0.5 ml-1">
            <span className="text-muted/50">-&gt;</span>
            <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
              {n.paths.map(p => (
                <EncounterLink key={p.encounterId} path={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </CollapsibleSection>
  )
}

function ObjectSection({
  objects,
  onNavigate,
}: {
  objects: GroupedObject[]
  onNavigate: (p: EncounterPath) => void
}) {
  return (
    <CollapsibleSection icon="🎒" label="Objetos" count={objects.length}>
      {objects.map(o => (
        <div key={o.objectId} className="text-[10px] py-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>{o.typeIcon}</span>
              <span className="text-fg font-medium">{o.name}</span>
              {o.totalQuantity > 1 && (
                <span className="text-accent font-mono">x{o.totalQuantity}</span>
              )}
            </div>
            <span className="text-muted/60">{o.type}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 ml-1">
            <span className="text-muted/50">-&gt;</span>
            <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
              {o.paths.map(p => (
                <EncounterLink key={p.encounterId} path={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </CollapsibleSection>
  )
}

function RewardsSection({
  rewards,
  onNavigate,
}: {
  rewards: AggregatedRewards
  onNavigate: (p: EncounterPath) => void
}) {
  const total = (rewards.totalXP > 0 ? 1 : 0) + (rewards.totalGold > 0 ? 1 : 0) + rewards.items.length
  if (total === 0) return null

  return (
    <CollapsibleSection icon="🏆" label="Recompensas" count={total}>
      {rewards.totalXP > 0 && (
        <div className="text-[10px] py-0.5 flex items-center gap-1.5">
          <span>⭐</span>
          <span className="text-fg font-medium">{rewards.totalXP.toLocaleString()} XP</span>
        </div>
      )}
      {rewards.totalGold > 0 && (
        <div className="text-[10px] py-0.5 flex items-center gap-1.5">
          <span>💰</span>
          <span className="text-fg font-medium">{rewards.totalGold.toLocaleString()} TO</span>
        </div>
      )}
      {rewards.items.map((item, i) => (
        <div key={i} className="text-[10px] py-0.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>🎒</span>
            <span className="text-fg">{item.name}</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-muted/50">-&gt;</span>
            <EncounterLink path={item.path} onNavigate={onNavigate} />
          </div>
        </div>
      ))}
    </CollapsibleSection>
  )
}

function CardSectionComponent({
  section,
}: {
  section: CardSection
}) {
  return (
    <CollapsibleSection icon={section.icon} label={section.label} count={section.cards.length}>
      {section.cards.map((gc, i) => (
        <div key={`${gc.card.id}-${i}`} className="flex items-center justify-between text-[10px] py-0.5">
          <span className="text-fg">{gc.card.name}</span>
          <span className="text-muted/60 ml-2">{gc.adventureName}</span>
        </div>
      ))}
    </CollapsibleSection>
  )
}

export default function HierarchySummary({ data, onNavigate }: HierarchySummaryProps) {
  const hasContent = data.totalEnemies > 0 || data.totalCards > 0 ||
    data.npcs.length > 0 || data.objects.length > 0 ||
    (data.rewards.totalXP > 0 || data.rewards.totalGold > 0 || data.rewards.items.length > 0)

  if (!hasContent) return null

  return (
    <div className="space-y-1.5 px-2 pb-2">
      <div className="flex items-center gap-1.5 pt-1">
        <div className="flex-1 border-t border-stroke/50" />
        <span className="text-[9px] text-muted uppercase tracking-wider">Resumo</span>
        <div className="flex-1 border-t border-stroke/50" />
      </div>

      {data.totalEnemies > 0 && (
        <EnemySection enemies={data.enemies} total={data.totalEnemies} onNavigate={onNavigate} />
      )}

      {data.npcs.length > 0 && (
        <NPCSection npcs={data.npcs} onNavigate={onNavigate} />
      )}

      {data.objects.length > 0 && (
        <ObjectSection objects={data.objects} onNavigate={onNavigate} />
      )}

      <RewardsSection rewards={data.rewards} onNavigate={onNavigate} />

      {data.cardSections.map(section => (
        <CardSectionComponent key={section.type} section={section} />
      ))}
    </div>
  )
}
