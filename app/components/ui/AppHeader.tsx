import { Link, useLocation } from "@remix-run/react"

export default function AppHeader() {
  const { pathname } = useLocation()

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
      </nav>
    </header>
  )
}
