import { useState } from 'react'
import Modal from '~/components/ui/Modal'
import type { EquipmentItem, ItemEffect } from '~/types/character'

type AddItemModalProps = {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: EquipmentItem) => void
}

type TabType = 'search' | 'create'

export default function AddItemModal({ isOpen, onClose, onAddItem }: AddItemModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('search')

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState<string>('all')
  const [searchResults, setSearchResults] = useState<EquipmentItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Create tab state
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [newItemWeight, setNewItemWeight] = useState('')
  const [newItemSpaces, setNewItemSpaces] = useState('1')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemCategory, setNewItemCategory] = useState<EquipmentItem['category']>('equipment')
  const [newItemEffects, setNewItemEffects] = useState<ItemEffect[]>([])

  // Effect creation state
  const [effectModalOpen, setEffectModalOpen] = useState(false)
  const [currentEffect, setCurrentEffect] = useState<Partial<ItemEffect>>({
    type: 'passive',
  })

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/items?query=${searchQuery}&category=${searchCategory}`)
      const data = await response.json()
      setSearchResults(data.items || [])
    } catch (error) {
      console.error('Error searching items:', error)
      // Mock data for now
      setSearchResults([
        {
          id: 'potion-1',
          name: 'Poção de Cura Menor',
          description: 'Restaura 2d8+2 PV',
          quantity: 1,
          weight: 0.1,
          spaces: 0.5,
          price: 50,
          category: 'alchemical',
          effects: [{
            id: 'heal-1',
            name: 'Cura',
            description: 'Restaura 2d8+2 pontos de vida',
            type: 'consumable',
            activeAbility: {
              name: 'Beber Poção',
              description: 'Consome a poção e restaura vida',
              actionType: 'standard',
              consumeItem: true,
            },
          }],
        },
      ])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddEffect = () => {
    if (!currentEffect.name || !currentEffect.description) {
      alert('Nome e descrição do efeito são obrigatórios')
      return
    }

    const newEffect: ItemEffect = {
      id: `effect-${Date.now()}`,
      name: currentEffect.name!,
      description: currentEffect.description!,
      type: currentEffect.type || 'passive',
      passiveModifiers: currentEffect.passiveModifiers,
      activeAbility: currentEffect.activeAbility,
    }

    setNewItemEffects([...newItemEffects, newEffect])
    setEffectModalOpen(false)
    setCurrentEffect({ type: 'passive' })
  }

  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      alert('Nome do item é obrigatório')
      return
    }

    const newItem: EquipmentItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      description: newItemDescription || undefined,
      quantity: parseInt(newItemQuantity) || 1,
      weight: parseFloat(newItemWeight) || undefined,
      spaces: parseFloat(newItemSpaces) || 1,
      price: parseFloat(newItemPrice) || undefined,
      category: newItemCategory,
      effects: newItemEffects.length > 0 ? newItemEffects : undefined,
    }

    onAddItem(newItem)
    handleClose()
  }

  const handleClose = () => {
    onClose()
    // Reset all state
    setActiveTab('search')
    setSearchQuery('')
    setSearchCategory('all')
    setSearchResults([])
    setNewItemName('')
    setNewItemDescription('')
    setNewItemQuantity('1')
    setNewItemWeight('')
    setNewItemSpaces('1')
    setNewItemPrice('')
    setNewItemCategory('equipment')
    setNewItemEffects([])
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Item">
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-stroke">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'search'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Buscar Itens
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'create'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Criar Novo
            </button>
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Search Filters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-muted mb-1">
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                    placeholder="Nome do item..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted mb-1">
                    Categoria
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                  >
                    <option value="all">Todas</option>
                    <option value="weapon">Arma</option>
                    <option value="armor">Armadura</option>
                    <option value="equipment">Equipamento</option>
                    <option value="alchemical">Alquímico</option>
                    <option value="tool">Ferramenta</option>
                    <option value="clothing">Roupa</option>
                    <option value="esoteric">Esotérico</option>
                    <option value="food">Comida</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold disabled:opacity-50"
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8 text-muted italic">
                    Use os filtros acima para buscar itens
                  </div>
                )}
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card-muted border border-stroke rounded p-3 hover:border-accent transition-colors cursor-pointer"
                    onClick={() => {
                      onAddItem({ ...item, id: `item-${Date.now()}` })
                      handleClose()
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted mt-1">{item.description}</div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted">
                          {item.category && <span className="bg-card px-2 py-0.5 rounded">{item.category}</span>}
                          {item.price && <span>{item.price} TP</span>}
                          {item.weight && <span>{item.weight} kg</span>}
                          {item.spaces && <span>{item.spaces} esp.</span>}
                        </div>
                        {item.effects && item.effects.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="font-semibold text-accent">Efeitos:</span>{' '}
                            {item.effects.map(e => e.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <button className="ml-2 px-3 py-1 bg-accent text-card rounded text-sm hover:bg-accent-hover">
                        Adicionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-semibold text-muted mb-1">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                  placeholder="Ex: Poção de Cura"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted mb-1">
                  Descrição
                </label>
                <textarea
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none resize-none"
                  rows={2}
                  placeholder="Ex: Restaura 2d8+2 PV"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted mb-1">
                  Categoria *
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as EquipmentItem['category'])}
                  className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                >
                  <option value="weapon">Arma</option>
                  <option value="armor">Armadura</option>
                  <option value="equipment">Equipamento</option>
                  <option value="alchemical">Alquímico</option>
                  <option value="tool">Ferramenta</option>
                  <option value="clothing">Roupa</option>
                  <option value="esoteric">Esotérico</option>
                  <option value="food">Comida</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-muted mb-1">Qtd</label>
                  <input
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted mb-1">Peso</label>
                  <input
                    type="number"
                    value={newItemWeight}
                    onChange={(e) => setNewItemWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                    step="0.1"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted mb-1">Esp. *</label>
                  <input
                    type="number"
                    value={newItemSpaces}
                    onChange={(e) => setNewItemSpaces(e.target.value)}
                    className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                    step="0.5"
                    min="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted mb-1">TP</label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
                    step="0.1"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Effects Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-muted">
                    Efeitos
                  </label>
                  <button
                    onClick={() => setEffectModalOpen(true)}
                    className="text-xs px-2 py-1 bg-accent text-card rounded hover:bg-accent-hover"
                  >
                    + Adicionar Efeito
                  </button>
                </div>
                {newItemEffects.length === 0 && (
                  <div className="text-center py-4 text-muted italic text-sm bg-card-muted rounded">
                    Nenhum efeito adicionado
                  </div>
                )}
                <div className="space-y-2">
                  {newItemEffects.map((effect, idx) => (
                    <div key={effect.id} className="bg-card-muted border border-stroke rounded p-2 text-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{effect.name}</div>
                          <div className="text-xs text-muted">{effect.description}</div>
                          <div className="text-xs mt-1">
                            <span className={`px-1.5 py-0.5 rounded ${
                              effect.type === 'passive' ? 'bg-blue-500/20 text-blue-400' :
                              effect.type === 'active' ? 'bg-green-500/20 text-green-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              {effect.type === 'passive' ? 'Passivo' :
                               effect.type === 'active' ? 'Ativo' : 'Consumível'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setNewItemEffects(newItemEffects.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-600 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateItem}
                  className="flex-1 px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
                  disabled={!newItemName.trim()}
                >
                  Criar Item
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Effect Creation Modal */}
      <Modal
        isOpen={effectModalOpen}
        onClose={() => {
          setEffectModalOpen(false)
          setCurrentEffect({ type: 'passive' })
        }}
        title="Adicionar Efeito"
      >
        <div className="space-y-4">
          {/* Effect Type */}
          <div>
            <label className="block text-sm font-semibold text-muted mb-2">
              Tipo de Efeito *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCurrentEffect({ ...currentEffect, type: 'passive' })}
                className={`p-2 rounded border-2 transition-all text-sm ${
                  currentEffect.type === 'passive'
                    ? 'border-accent bg-accent/10'
                    : 'border-stroke hover:border-accent/50'
                }`}
              >
                Passivo
              </button>
              <button
                onClick={() => setCurrentEffect({ ...currentEffect, type: 'active' })}
                className={`p-2 rounded border-2 transition-all text-sm ${
                  currentEffect.type === 'active'
                    ? 'border-accent bg-accent/10'
                    : 'border-stroke hover:border-accent/50'
                }`}
              >
                Ativo
              </button>
              <button
                onClick={() => setCurrentEffect({ ...currentEffect, type: 'consumable' })}
                className={`p-2 rounded border-2 transition-all text-sm ${
                  currentEffect.type === 'consumable'
                    ? 'border-accent bg-accent/10'
                    : 'border-stroke hover:border-accent/50'
                }`}
              >
                Consumível
              </button>
            </div>
          </div>

          {/* Effect Name */}
          <div>
            <label className="block text-sm font-semibold text-muted mb-1">
              Nome do Efeito *
            </label>
            <input
              type="text"
              value={currentEffect.name || ''}
              onChange={(e) => setCurrentEffect({ ...currentEffect, name: e.target.value })}
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
              placeholder="Ex: Bônus de Força"
            />
          </div>

          {/* Effect Description */}
          <div>
            <label className="block text-sm font-semibold text-muted mb-1">
              Descrição *
            </label>
            <textarea
              value={currentEffect.description || ''}
              onChange={(e) => setCurrentEffect({ ...currentEffect, description: e.target.value })}
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none resize-none"
              rows={2}
              placeholder="Descreva o efeito..."
            />
          </div>

          {/* Type-specific fields */}
          {currentEffect.type === 'passive' && (
            <div className="text-sm text-muted bg-card-muted p-3 rounded">
              <strong>Efeito Passivo:</strong> Aplicado automaticamente quando o item é equipado.
              <br />
              <em className="text-xs">Exemplos: +2 CA, +3 FOR, Vantagem em testes de Percepção</em>
            </div>
          )}

          {(currentEffect.type === 'active' || currentEffect.type === 'consumable') && (
            <div className="text-sm text-muted bg-card-muted p-3 rounded">
              <strong>{currentEffect.type === 'consumable' ? 'Consumível' : 'Ativo'}:</strong>{' '}
              {currentEffect.type === 'consumable'
                ? 'Item é consumido ao usar, aplicando o efeito.'
                : 'Fornece uma habilidade utilizável sem consumir o item.'}
              <br />
              <em className="text-xs">
                {currentEffect.type === 'consumable'
                  ? 'Exemplos: Poção de Cura, Pergaminho de Magia'
                  : 'Exemplos: Bastão com Bola de Fogo (3x/dia), Anel de Invisibilidade'}
              </em>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setEffectModalOpen(false)
                setCurrentEffect({ type: 'passive' })
              }}
              className="flex-1 px-4 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddEffect}
              className="flex-1 px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
              disabled={!currentEffect.name || !currentEffect.description}
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
