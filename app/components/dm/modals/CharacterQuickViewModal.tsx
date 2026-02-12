import Modal from '~/components/ui/Modal'
import type { Character } from '~/types/character'
import type { CharacterSnapshotData } from '~/types/mesa'
import { getTotalLevel } from '~/utils/tormenta20'

type CharacterQuickViewModalProps = {
  isOpen: boolean
  onClose: () => void
  character: Character
  snapshotData: CharacterSnapshotData
}

export default function CharacterQuickViewModal({
  isOpen,
  onClose,
  character,
  snapshotData,
}: CharacterQuickViewModalProps) {
  const classesText = character.classes.map(c => `${c.name} ${c.level}`).join(' / ')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={character.name}>
      <div className="space-y-4">
        {/* Header with image and basic info */}
        <div className="flex gap-4">
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-card-muted flex items-center justify-center text-3xl">
              🎭
            </div>
          )}
          <div>
            <div className="font-bold text-lg">{character.name}</div>
            <div className="text-sm text-muted">{classesText}</div>
            <div className="text-sm text-muted">Nível {getTotalLevel(character.classes)}</div>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card-muted rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Pontos de Vida</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-4 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(snapshotData.health.current / snapshotData.health.max) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold">
                {snapshotData.health.current}/{snapshotData.health.max}
              </span>
            </div>
          </div>

          <div className="bg-card-muted rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Pontos de Mana</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-4 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(snapshotData.mana.current / snapshotData.mana.max) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold">
                {snapshotData.mana.current}/{snapshotData.mana.max}
              </span>
            </div>
          </div>
        </div>

        {/* Defenses */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-card-muted rounded-lg p-2 text-center">
            <div className="text-xs text-muted">CA</div>
            <div className="font-bold text-lg">{snapshotData.ca}</div>
          </div>
          <div className="bg-card-muted rounded-lg p-2 text-center">
            <div className="text-xs text-muted">Fort</div>
            <div className="font-bold">+{snapshotData.resistances.fortitude}</div>
          </div>
          <div className="bg-card-muted rounded-lg p-2 text-center">
            <div className="text-xs text-muted">Refl</div>
            <div className="font-bold">+{snapshotData.resistances.reflexos}</div>
          </div>
          <div className="bg-card-muted rounded-lg p-2 text-center">
            <div className="text-xs text-muted">Vont</div>
            <div className="font-bold">+{snapshotData.resistances.vontade}</div>
          </div>
        </div>

        {/* Attributes */}
        <div>
          <div className="text-sm font-semibold mb-2">Atributos</div>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(snapshotData.attributes).map(([key, attr]) => (
              <div key={key} className="bg-card-muted rounded-lg p-2 text-center">
                <div className="text-xs text-muted">{key}</div>
                <div className="font-bold">{attr.modifier >= 0 ? '+' : ''}{attr.modifier}</div>
                <div className="text-[10px] text-muted">({attr.value})</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills summary (top visible ones) */}
        {character.skills.filter(s => s.visibleInSummary).length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">Perícias em Destaque</div>
            <div className="flex flex-wrap gap-2">
              {character.skills
                .filter(s => s.visibleInSummary)
                .slice(0, 6)
                .map(skill => (
                  <div
                    key={skill.name}
                    className="bg-card-muted rounded px-2 py-1 text-xs"
                  >
                    <span className="text-muted">{skill.name}</span>
                    <span className="font-bold ml-1">
                      {skill.modifier >= 0 ? '+' : ''}{skill.modifier}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
