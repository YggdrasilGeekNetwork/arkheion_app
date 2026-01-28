import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [
    { title: "Arkheion - Home" },
    { name: "description", content: "Arkheion RPG Character Management" },
  ]
}

export default function Home() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-accent mb-4">ARKHEION</h1>
        <p className="text-xl text-muted">Sistema de Gerenciamento de Personagens RPG</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Link
          to="/login"
          className="bg-card border border-stroke rounded-lg p-8 hover:bg-card-muted transition-colors text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Entrar</h2>
          <p className="text-muted">Já tem uma conta? Faça login</p>
        </Link>

        <Link
          to="/signup"
          className="bg-card border border-stroke rounded-lg p-8 hover:bg-card-muted transition-colors text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Cadastrar</h2>
          <p className="text-muted">Nova aventura começa aqui</p>
        </Link>
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-6">Recursos</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-stroke rounded-lg p-6">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-bold mb-2">Gestão Completa</h4>
            <p className="text-sm text-muted">
              Gerencie atributos, perícias, equipamentos e muito mais
            </p>
          </div>

          <div className="bg-card border border-stroke rounded-lg p-6">
            <div className="text-4xl mb-3">⚔️</div>
            <h4 className="font-bold mb-2">Modo Combate</h4>
            <p className="text-sm text-muted">
              Sistema completo de gerenciamento de combate e ações
            </p>
          </div>

          <div className="bg-card border border-stroke rounded-lg p-6">
            <div className="text-4xl mb-3">🎲</div>
            <h4 className="font-bold mb-2">Rolagem de Dados</h4>
            <p className="text-sm text-muted">
              Sistema integrado de rolagem com histórico
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
