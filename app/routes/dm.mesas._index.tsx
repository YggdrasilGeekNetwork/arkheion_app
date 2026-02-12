import type { MetaFunction } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/node"
import type { MesaSummary } from "~/types/mesa"

export const meta: MetaFunction = () => {
  return [
    { title: "Minhas Mesas - Arkheion" },
    { name: "description", content: "Gerencie suas mesas de RPG" },
  ]
}

export async function loader() {
  // MOCKED: Return mock mesa list
  const mockMesas: MesaSummary[] = [
    {
      id: "mesa-1",
      name: "A Maldição do Castelo Sombrio",
      imageUrl: "https://via.placeholder.com/300x200",
      characterCount: 4,
      updatedAt: "2024-01-20T15:30:00Z",
    },
    {
      id: "mesa-2",
      name: "Os Segredos de Valkaria",
      imageUrl: "https://via.placeholder.com/300x200",
      characterCount: 5,
      updatedAt: "2024-01-18T10:00:00Z",
    },
    {
      id: "mesa-3",
      name: "A Ascensão do Dragão Negro",
      characterCount: 3,
      updatedAt: "2024-01-10T20:00:00Z",
    },
  ]

  return json({ mesas: mockMesas })
}

export default function MesasList() {
  const { mesas } = useLoaderData<typeof loader>()

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-accent mb-2">Minhas Mesas</h1>
          <p className="text-muted">Gerencie suas mesas de RPG e personagens</p>
        </div>
        <button
          className="px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
          onClick={() => alert('Criar nova mesa - em breve!')}
        >
          + Nova Mesa
        </button>
      </div>

      {/* Mesas Grid */}
      {mesas.length === 0 ? (
        <div className="bg-card border border-stroke rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🎲</div>
          <h2 className="text-2xl font-bold mb-2">Nenhuma mesa ainda</h2>
          <p className="text-muted mb-6">Crie sua primeira mesa para começar a mestrar</p>
          <button
            className="inline-block px-6 py-3 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
            onClick={() => alert('Criar nova mesa - em breve!')}
          >
            Criar Mesa
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mesas.map((mesa) => (
            <Link
              key={mesa.id}
              to={`/dm/mesas/${mesa.id}`}
              className="bg-card border border-stroke rounded-lg overflow-hidden hover:border-accent transition-colors group"
            >
              {/* Mesa Image */}
              <div className="aspect-video overflow-hidden bg-card-muted">
                {mesa.imageUrl ? (
                  <img
                    src={mesa.imageUrl}
                    alt={mesa.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🎲
                  </div>
                )}
              </div>

              {/* Mesa Info */}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 truncate">{mesa.name}</h3>
                <div className="text-sm text-muted space-y-1">
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>{mesa.characterCount} personagens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Atualizada em {new Date(mesa.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <Link to="/home" className="text-muted hover:text-text">
          ← Voltar para home
        </Link>
      </div>
    </div>
  )
}
