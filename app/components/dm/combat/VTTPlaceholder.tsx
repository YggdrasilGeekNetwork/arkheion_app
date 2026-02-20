export default function VTTPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg/50">
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-30">🗺️</div>
        <h2 className="text-lg font-bold text-muted mb-1">Mapa de Combate</h2>
        <p className="text-sm text-muted/60 mb-4">Area reservada para o VTT</p>
        <button className="px-4 py-2 bg-accent/15 text-accent border border-accent/40 rounded-lg text-sm font-medium hover:bg-accent/25 transition-colors">
          Conectar VTT
        </button>
      </div>
    </div>
  )
}
