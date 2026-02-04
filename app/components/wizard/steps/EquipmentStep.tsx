import { useWizard } from '~/contexts/WizardContext'
import { InlineChoiceResolver } from '../ChoiceResolver'

export default function EquipmentStep() {
  const { state, dispatch, loaderData, getChoicesForStep, resolveChoice } = useWizard()
  const { equipmentMethod, startingEquipment, currencies, origin } = state.data

  const origins = loaderData?.origins || []
  const equipmentChoices = getChoicesForStep('equipment')

  const selectedOrigin = origin ? origins.find(o => o.id === origin.id) : null
  const startingGold = selectedOrigin?.startingGold || 100

  const handleMethodChange = (method: typeof equipmentMethod) => {
    dispatch({ type: 'SET_EQUIPMENT_METHOD', payload: method })

    if (method === 'gold') {
      dispatch({
        type: 'SET_CURRENCIES',
        payload: { tc: 0, tp: 0, to: startingGold },
      })
    } else {
      dispatch({
        type: 'SET_CURRENCIES',
        payload: { tc: 0, tp: 0, to: 0 },
      })
    }
  }

  const handleCurrencyChange = (type: 'tc' | 'tp' | 'to', value: number) => {
    dispatch({
      type: 'SET_CURRENCIES',
      payload: {
        ...currencies,
        [type]: Math.max(0, value),
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Equipamento Inicial</h2>
        <p className="text-sm text-muted">
          Escolha como deseja obter o equipamento inicial do seu personagem.
        </p>
      </div>

      {/* Method Selection */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleMethodChange('package')}
          className={`text-left p-4 rounded-lg border-2 transition-all ${
            equipmentMethod === 'package'
              ? 'border-accent bg-accent/10'
              : 'border-stroke bg-card hover:border-accent/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-card-muted flex items-center justify-center text-xl">
              📦
            </div>
            <div>
              <h3 className="font-semibold">Pacote de Classe</h3>
              <p className="text-xs text-muted">Receba um conjunto pré-definido de equipamentos</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleMethodChange('gold')}
          className={`text-left p-4 rounded-lg border-2 transition-all ${
            equipmentMethod === 'gold'
              ? 'border-accent bg-accent/10'
              : 'border-stroke bg-card hover:border-accent/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-card-muted flex items-center justify-center text-xl">
              💰
            </div>
            <div>
              <h3 className="font-semibold">Ouro Inicial</h3>
              <p className="text-xs text-muted">
                Receba {startingGold} TO para comprar equipamentos
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Equipment Choices (for package method) */}
      {equipmentMethod === 'package' && equipmentChoices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Escolhas de Equipamento</h3>
          <InlineChoiceResolver
            choices={equipmentChoices}
            onResolve={resolveChoice}
          />
        </div>
      )}

      {/* Package Content Preview */}
      {equipmentMethod === 'package' && (
        <div className="bg-card border border-stroke rounded-lg p-4">
          <h3 className="font-semibold mb-3">Equipamento do Pacote</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">Armas</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {startingEquipment.weapons.length > 0 ? (
                  startingEquipment.weapons.map((weapon, index) => (
                    <div key={index} className="bg-card-muted rounded px-3 py-2 text-sm">
                      {weapon.name}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted italic">
                    Resolva as escolhas acima para definir suas armas
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted mb-2">Armadura</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {startingEquipment.armor.length > 0 ? (
                  startingEquipment.armor.map((armor, index) => (
                    <div key={index} className="bg-card-muted rounded px-3 py-2 text-sm">
                      {armor.name}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted italic">
                    Armadura básica da classe
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted mb-2">Outros Itens</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="bg-card-muted rounded px-3 py-2 text-sm">Mochila</div>
                <div className="bg-card-muted rounded px-3 py-2 text-sm">Ração de viagem (5)</div>
                <div className="bg-card-muted rounded px-3 py-2 text-sm">Cantil</div>
                <div className="bg-card-muted rounded px-3 py-2 text-sm">Corda (15m)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Currency Input (for gold method) */}
      {equipmentMethod === 'gold' && (
        <div className="bg-card border border-stroke rounded-lg p-4">
          <h3 className="font-semibold mb-3">Dinheiro Inicial</h3>
          <p className="text-sm text-muted mb-4">
            Você pode distribuir seu dinheiro entre diferentes moedas.
            10 TC = 1 TP, 10 TP = 1 TO.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                <span className="text-amber-600">●</span> Tibares de Ouro (TO)
              </label>
              <input
                type="number"
                value={currencies.to}
                onChange={(e) => handleCurrencyChange('to', parseInt(e.target.value) || 0)}
                min={0}
                className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <span className="text-gray-400">●</span> Tibares de Prata (TP)
              </label>
              <input
                type="number"
                value={currencies.tp}
                onChange={(e) => handleCurrencyChange('tp', parseInt(e.target.value) || 0)}
                min={0}
                className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <span className="text-amber-800">●</span> Tibares de Cobre (TC)
              </label>
              <input
                type="number"
                value={currencies.tc}
                onChange={(e) => handleCurrencyChange('tc', parseInt(e.target.value) || 0)}
                min={0}
                className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-card-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Valor Total:</span>
              <span className="font-bold text-accent">
                {(currencies.to + currencies.tp / 10 + currencies.tc / 100).toFixed(2)} TO
              </span>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted">
            <p>
              Com este método, você pode comprar equipamentos na loja após criar o personagem.
              Os equipamentos não serão incluídos na ficha inicial.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Resumo</h3>
        <div className="text-sm space-y-1">
          <p>
            <span className="text-muted">Método:</span>{' '}
            <span className="font-medium">
              {equipmentMethod === 'package' ? 'Pacote de Classe' : 'Ouro Inicial'}
            </span>
          </p>
          {equipmentMethod === 'gold' && (
            <p>
              <span className="text-muted">Dinheiro:</span>{' '}
              <span className="font-medium">
                {currencies.to > 0 && `${currencies.to} TO `}
                {currencies.tp > 0 && `${currencies.tp} TP `}
                {currencies.tc > 0 && `${currencies.tc} TC`}
                {currencies.to === 0 && currencies.tp === 0 && currencies.tc === 0 && 'Nenhum'}
              </span>
            </p>
          )}
          {equipmentMethod === 'package' && (
            <p>
              <span className="text-muted">Escolhas pendentes:</span>{' '}
              <span className={`font-medium ${
                equipmentChoices.filter(c => !c.isResolved).length > 0
                  ? 'text-yellow-500'
                  : 'text-accent'
              }`}>
                {equipmentChoices.filter(c => !c.isResolved).length > 0
                  ? `${equipmentChoices.filter(c => !c.isResolved).length} escolha(s)`
                  : 'Todas resolvidas'}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
