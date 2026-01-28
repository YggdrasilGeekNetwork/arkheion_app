import { useState } from 'react'
import Modal from '~/components/ui/Modal'
import type { WeaponAttack } from '~/types/character'

type WeaponModalProps = {
  isOpen: boolean
  onClose: () => void
  weapons: WeaponAttack[]
  onAddWeapon: (weapon: Omit<WeaponAttack, 'id'>) => void
  onUpdateWeapon: (weaponId: string, weapon: Omit<WeaponAttack, 'id' | 'isFavorite'>) => void
  onRemoveWeapon: (weaponId: string) => void
  onToggleFavorite: (weaponId: string) => void
}

export default function WeaponModal({
  isOpen,
  onClose,
  weapons,
  onAddWeapon,
  onUpdateWeapon,
  onRemoveWeapon,
  onToggleFavorite
}: WeaponModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [weaponForm, setWeaponForm] = useState({
    name: '',
    damage: '',
    damageType: '',
    attackBonus: 0,
    attackAttribute: 'FOR',
    critRange: '20',
    critMultiplier: 'x2',
    range: '',
    actionType: 'standard' as 'standard' | 'full',
  })

  const resetForm = () => {
    setWeaponForm({
      name: '',
      damage: '',
      damageType: '',
      attackBonus: 0,
      attackAttribute: 'FOR',
      critRange: '20',
      critMultiplier: 'x2',
      range: '',
      actionType: 'standard',
    })
    setIsEditing(false)
    setEditingId(null)
  }

  const handleEdit = (weapon: WeaponAttack) => {
    setWeaponForm({
      name: weapon.name,
      damage: weapon.damage,
      damageType: weapon.damageType || '',
      attackBonus: weapon.attackBonus,
      attackAttribute: weapon.attackAttribute || 'FOR',
      critRange: weapon.critRange || '20',
      critMultiplier: weapon.critMultiplier || 'x2',
      range: weapon.range || '',
      actionType: weapon.actionType,
    })
    setEditingId(weapon.id)
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      onUpdateWeapon(editingId, weaponForm)
    } else {
      onAddWeapon(weaponForm)
    }
    resetForm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Ataques">
      <div className="space-y-4">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
          >
            + Adicionar Ataque
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card-muted border border-stroke rounded-lg p-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Nome da Arma *</label>
              <input
                type="text"
                value={weaponForm.name}
                onChange={(e) => setWeaponForm({ ...weaponForm, name: e.target.value })}
                required
                className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
                placeholder="Ex: Espada Longa"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Dano *</label>
                <input
                  type="text"
                  value={weaponForm.damage}
                  onChange={(e) => setWeaponForm({ ...weaponForm, damage: e.target.value })}
                  required
                  className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
                  placeholder="1d8+3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Tipo de Dano</label>
                <input
                  type="text"
                  value={weaponForm.damageType}
                  onChange={(e) => setWeaponForm({ ...weaponForm, damageType: e.target.value })}
                  className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
                  placeholder="Cortante"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Atributo de Ataque *</label>
                <select
                  value={weaponForm.attackAttribute}
                  onChange={(e) => setWeaponForm({ ...weaponForm, attackAttribute: e.target.value })}
                  className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
                >
                  <option value="FOR">Força (FOR)</option>
                  <option value="DES">Destreza (DES)</option>
                  <option value="CON">Constituição (CON)</option>
                  <option value="INT">Inteligência (INT)</option>
                  <option value="SAB">Sabedoria (SAB)</option>
                  <option value="CAR">Carisma (CAR)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Bônus de Ataque</label>
                <input
                  type="number"
                  value={weaponForm.attackBonus}
                  onChange={(e) => setWeaponForm({ ...weaponForm, attackBonus: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
                  placeholder="Ex: +2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Alcance</label>
              <input
                type="text"
                value={weaponForm.range}
                onChange={(e) => setWeaponForm({ ...weaponForm, range: e.target.value })}
                className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
                placeholder="9m"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Margem de Ameaça</label>
                <input
                  type="text"
                  value={weaponForm.critRange}
                  onChange={(e) => setWeaponForm({ ...weaponForm, critRange: e.target.value })}
                  className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Multiplicador</label>
                <input
                  type="text"
                  value={weaponForm.critMultiplier}
                  onChange={(e) => setWeaponForm({ ...weaponForm, critMultiplier: e.target.value })}
                  className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
                  placeholder="x2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Tipo de Ação *</label>
              <select
                value={weaponForm.actionType}
                onChange={(e) => setWeaponForm({ ...weaponForm, actionType: e.target.value as 'standard' | 'full' })}
                className="w-full px-2 py-1 bg-card border border-stroke rounded text-sm"
              >
                <option value="standard">Ação Padrão</option>
                <option value="full">Ação Completa</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold text-sm"
              >
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 bg-card border border-stroke rounded hover:border-accent transition-colors font-semibold text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {weapons.map((weapon) => (
            <div
              key={weapon.id}
              className="bg-card-muted border border-stroke rounded-lg p-3 flex flex-col"
            >
              <div className="flex-1 mb-2">
                <div className="font-semibold text-sm mb-2">{weapon.name}</div>
                <div className="text-xs text-muted mb-1">
                  Ataque: {weapon.attackBonus >= 0 ? '+' : ''}{weapon.attackBonus}
                </div>
                <div className="text-xs text-muted mb-1">
                  Dano: {weapon.damage} {weapon.damageType && `(${weapon.damageType})`}
                </div>
                <div className="text-xs text-muted mb-1">
                  Crítico: {weapon.critRange}/{weapon.critMultiplier}
                </div>
                {weapon.range && (
                  <div className="text-xs text-muted">
                    Alcance: {weapon.range}
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-between items-center pt-2 border-t border-stroke">
                <button
                  onClick={() => handleEdit(weapon)}
                  className="text-xs px-2 py-1 bg-card border border-stroke rounded hover:border-accent transition-colors font-semibold"
                >
                  Editar
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleFavorite(weapon.id)}
                    className="text-lg leading-none hover:scale-110 transition-transform"
                    style={{ color: weapon.isFavorite ? '#fbbf24' : '#9ca3af' }}
                  >
                    {weapon.isFavorite ? '★' : '☆'}
                  </button>
                  <button
                    onClick={() => onRemoveWeapon(weapon.id)}
                    className="text-red-500 hover:text-red-600 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
