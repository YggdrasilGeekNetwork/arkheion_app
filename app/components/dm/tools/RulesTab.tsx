import { useState } from 'react'
import { RULES, RULE_CATEGORIES } from '~/data/rulesReference'
import type { RuleCategory } from '~/data/rulesReference'

export default function RulesTab() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<RuleCategory | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = RULES.filter(rule => {
    if (categoryFilter && rule.category !== categoryFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return rule.title.toLowerCase().includes(q) ||
        rule.tags.some(t => t.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <div className="flex flex-col h-full overflow-hidden gap-1.5">
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar regras..."
        className="w-full bg-surface/50 border border-stroke rounded px-2 py-1
          text-xs text-fg placeholder:text-muted/40 outline-none
          focus:border-accent/40 transition-colors flex-shrink-0"
      />

      {/* Category chips */}
      <div className="flex gap-1 flex-wrap flex-shrink-0">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-1.5 py-0.5 rounded text-[10px] transition-colors
            ${!categoryFilter
              ? 'bg-accent/20 text-accent border border-accent/40'
              : 'bg-surface/50 text-muted border border-stroke hover:border-accent/30'
            }`}
        >
          Todas
        </button>
        {RULE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors flex items-center gap-0.5
              ${categoryFilter === cat.id
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-surface/50 text-muted border border-stroke hover:border-accent/30'
              }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-[10px] text-muted/60">Nenhuma regra encontrada</div>
          </div>
        ) : (
          filtered.map(rule => {
            const isExpanded = expandedId === rule.id
            const catInfo = RULE_CATEGORIES.find(c => c.id === rule.category)
            return (
              <button
                key={rule.id}
                onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                className="w-full text-left border border-stroke rounded-md overflow-hidden
                  hover:border-accent/20 transition-colors"
              >
                <div className="flex items-center gap-1.5 px-2 py-1.5">
                  <span className="text-[10px]">{catInfo?.icon}</span>
                  <span className="text-xs font-medium text-fg flex-1">{rule.title}</span>
                  <span className="text-[9px] text-muted/50">{catInfo?.label}</span>
                  <span className="text-[10px] text-muted">{isExpanded ? '▾' : '▸'}</span>
                </div>
                {isExpanded && (
                  <div className="px-2 pb-2 border-t border-stroke/50">
                    <p className="text-[10px] text-fg/80 leading-relaxed mt-1.5">
                      {rule.content}
                    </p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {rule.tags.map(tag => (
                        <span key={tag} className="text-[8px] text-muted bg-surface px-1 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
