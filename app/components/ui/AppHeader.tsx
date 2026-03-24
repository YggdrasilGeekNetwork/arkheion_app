import { Link, useLocation, useRouteLoaderData } from "@remix-run/react"
import type { loader as rootLoader } from "~/root"

export default function AppHeader() {
  const { pathname } = useLocation()
  const rootData = useRouteLoaderData<typeof rootLoader>("root")
  const currentUser = rootData?.currentUser ?? null

  const links = [
    { to: "/characters", label: "Personagens" },
    { to: "/feedback", label: "Feedback" },
  ]

  return (
    <header className="w-full border-b border-stroke bg-card px-4 py-2 flex items-center justify-between">
      <Link to="/home" className="text-accent font-bold tracking-wide text-sm">
        ARKHEION
      </Link>
      <nav className="flex items-center gap-4">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-sm transition-colors ${
              pathname.startsWith(to)
                ? "text-accent font-semibold"
                : "text-muted hover:text-text"
            }`}
          >
            {label}
          </Link>
        ))}
        {currentUser && (
          <Link
            to="/profile"
            className={`flex items-center gap-2 text-sm transition-colors ${
              pathname === "/profile" ? "text-accent font-semibold" : "text-muted hover:text-text"
            }`}
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                {(currentUser.displayName || currentUser.username)[0].toUpperCase()}
              </div>
            )}
            <span>{currentUser.displayName || currentUser.username}</span>
          </Link>
        )}
      </nav>
    </header>
  )
}
