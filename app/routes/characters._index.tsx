import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/node"
import { getCharacters } from "~/utils/api"
import type { CharacterSummary } from "~/types/character"

export const meta: MetaFunction = () => {
  return [
    { title: "Meus Personagens - Arkheion" },
    { name: "description", content: "Gerencie seus personagens" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Check authentication

  // MOCKED: Always return mock data
  return json({
    characters: [
      {
        id: "1",
        name: "Thorin Escudo de Ferro",
        imageUrl: "https://via.placeholder.com/150",
        classes: [
          { name: "Guerreiro", level: 5 },
          { name: "Paladino", level: 3 }
        ],
        level: 8
      },
      {
        id: "2",
        name: "Lyra Sombravento",
        imageUrl: "https://via.placeholder.com/150",
        classes: [
          { name: "Ladino", level: 7 }
        ],
        level: 7
      }
    ] as CharacterSummary[]
  })

  // const result = await getCharacters()
  // if (result.error) {
  //   return json({ characters: [] })
  // }
  // return json({ characters: result.data || [] })
}

export default function Characters() {
  const { characters } = useLoaderData<typeof loader>()

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-accent mb-2">Meus Personagens</h1>
          <p className="text-muted">Escolha um personagem ou crie um novo</p>
        </div>
        <Link
          to="/characters/new"
          className="px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
        >
          + Novo Personagem
        </Link>
      </div>

      {/* Characters Grid */}
      {characters.length === 0 ? (
        <div className="bg-card border border-stroke rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📜</div>
          <h2 className="text-2xl font-bold mb-2">Nenhum personagem ainda</h2>
          <p className="text-muted mb-6">Crie seu primeiro personagem para começar sua aventura</p>
          <Link
            to="/characters/new"
            className="inline-block px-6 py-3 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
          >
            Criar Personagem
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Link
              key={character.id}
              to={`/characters/${character.id}`}
              className="bg-card border border-stroke rounded-lg overflow-hidden hover:border-accent transition-colors group"
            >
              {/* Character Image */}
              <div className="aspect-square overflow-hidden bg-card-muted">
                {character.imageUrl ? (
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🎭
                  </div>
                )}
              </div>

              {/* Character Info */}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 truncate">{character.name}</h3>
                <div className="text-sm text-muted space-y-1">
                  <div>
                    Nível {character.level}
                  </div>
                  <div>
                    {character.classes.map((cls, idx) => (
                      <span key={idx}>
                        {cls.name} {cls.level}
                        {idx < character.classes.length - 1 && " / "}
                      </span>
                    ))}
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
