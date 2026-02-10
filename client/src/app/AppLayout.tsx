import { NavLink, Outlet } from 'react-router-dom'

const navLinkBase =
  'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <NavLink to="/" className="text-sm font-semibold tracking-tight">
            ExpenseNest
          </NavLink>
          <nav className="flex items-center gap-2 text-xs text-zinc-300">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                [
                  navLinkBase,
                  isActive
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-200 hover:bg-zinc-800',
                ].join(' ')
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                [
                  navLinkBase,
                  isActive
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-200 hover:bg-zinc-800',
                ].join(' ')
              }
            >
              Transactions
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

