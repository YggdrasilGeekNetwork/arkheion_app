import { useState } from 'react'
import Card from '~/components/ui/Card'
import Modal from '~/components/ui/Modal'
import type { Currencies } from '~/types/character'

type CurrencyCardProps = {
  currencies: Currencies
  onCurrenciesChange?: (newCurrencies: Currencies) => void
}

export default function CurrencyCard({ currencies, onCurrenciesChange }: CurrencyCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTO, setEditTO] = useState(currencies.to.toString())
  const [editTP, setEditTP] = useState(currencies.tp.toString())
  const [editTC, setEditTC] = useState(currencies.tc.toString())

  // Calculate total in TP (standard currency)
  const totalTP = currencies.to * 10 + currencies.tp + currencies.tc / 10

  const handleOpenModal = () => {
    setEditTO(currencies.to.toString())
    setEditTP(currencies.tp.toString())
    setEditTC(currencies.tc.toString())
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (onCurrenciesChange) {
      onCurrenciesChange({
        to: parseInt(editTO) || 0,
        tp: parseInt(editTP) || 0,
        tc: parseInt(editTC) || 0,
      })
    }
    setIsModalOpen(false)
  }

  const handleAddCurrency = (type: 'to' | 'tp' | 'tc', amount: number) => {
    const current = {
      to: parseInt(editTO) || 0,
      tp: parseInt(editTP) || 0,
      tc: parseInt(editTC) || 0,
    }

    current[type] = Math.max(0, current[type] + amount)

    setEditTO(current.to.toString())
    setEditTP(current.tp.toString())
    setEditTC(current.tc.toString())
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">Moedas</h3>
          {onCurrenciesChange && (
            <button
              onClick={handleOpenModal}
              className="text-xs px-2 py-1 bg-accent text-card rounded hover:bg-accent-hover transition-colors"
            >
              Editar
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-card-muted rounded p-1.5 text-center">
            <div className="text-[10px] text-muted mb-0.5">TO</div>
            <div className="text-base font-bold text-yellow-600">{currencies.to}</div>
          </div>
          <div className="bg-card-muted rounded p-1.5 text-center">
            <div className="text-[10px] text-muted mb-0.5">TP</div>
            <div className="text-base font-bold text-gray-300">{currencies.tp}</div>
          </div>
          <div className="bg-card-muted rounded p-1.5 text-center">
            <div className="text-[10px] text-muted mb-0.5">TC</div>
            <div className="text-base font-bold text-orange-700">{currencies.tc}</div>
          </div>
        </div>

        <div className="text-[10px] text-muted mt-1.5 text-center">
          Total: {totalTP.toFixed(1)} TP
        </div>
      </Card>

      {/* Currency Edit Modal */}
      {onCurrenciesChange && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Editar Moedas"
        >
          <div className="space-y-4">
            {/* Tibares de Ouro */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Tibares de Ouro (TO)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddCurrency('to', -10)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => handleAddCurrency('to', -1)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={editTO}
                  onChange={(e) => setEditTO(e.target.value)}
                  className="flex-1 px-3 py-2 bg-card-muted border border-stroke rounded text-center font-bold text-yellow-600"
                  min="0"
                />
                <button
                  onClick={() => handleAddCurrency('to', 1)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => handleAddCurrency('to', 10)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +10
                </button>
              </div>
            </div>

            {/* Tibares de Prata */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Tibares de Prata (TP) - Padrão
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddCurrency('tp', -10)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => handleAddCurrency('tp', -1)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={editTP}
                  onChange={(e) => setEditTP(e.target.value)}
                  className="flex-1 px-3 py-2 bg-card-muted border border-stroke rounded text-center font-bold text-gray-300"
                  min="0"
                />
                <button
                  onClick={() => handleAddCurrency('tp', 1)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => handleAddCurrency('tp', 10)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +10
                </button>
              </div>
            </div>

            {/* Tibares de Cobre */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Tibares de Cobre (TC)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddCurrency('tc', -10)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => handleAddCurrency('tc', -1)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={editTC}
                  onChange={(e) => setEditTC(e.target.value)}
                  className="flex-1 px-3 py-2 bg-card-muted border border-stroke rounded text-center font-bold text-orange-700"
                  min="0"
                />
                <button
                  onClick={() => handleAddCurrency('tc', 1)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => handleAddCurrency('tc', 10)}
                  className="px-3 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +10
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-stroke">
              <div className="text-center">
                <div className="text-xs text-muted mb-1">Total em TP</div>
                <div className="text-2xl font-bold">
                  {((parseInt(editTO) || 0) * 10 + (parseInt(editTP) || 0) + (parseInt(editTC) || 0) / 10).toFixed(1)} TP
                </div>
              </div>
            </div>

            {/* Conversion Helper */}
            <div className="bg-card-muted rounded p-3">
              <div className="text-xs text-muted mb-2 font-semibold">Taxa de Conversão</div>
              <div className="text-xs space-y-1">
                <div>1 TO = 10 TP</div>
                <div>1 TP = 10 TC</div>
                <div>1 TO = 100 TC</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
