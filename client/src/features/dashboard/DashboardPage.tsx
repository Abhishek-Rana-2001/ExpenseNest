import { useEffect, useState } from 'react'

export function DashboardPage() {
  const [health, setHealth] = useState<string>('Loading…')

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const base =
          (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'
        const res = await fetch(`${base}/health`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: { ok: boolean; service: string; timestamp: string } =
          await res.json()
        if (!cancelled) setHealth(`${data.service} ok @ ${data.timestamp}`)
      } catch {
        if (!cancelled) setHealth('Server not reachable (is it running?)')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Personal Finance Tracker
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Welcome back. API status:
          <span className="ml-2 rounded-md bg-zinc-800 px-2 py-1 font-mono text-xs text-zinc-100">
            {health}
          </span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="text-sm font-medium">Overview</div>
          <div className="mt-1 text-xs text-zinc-400">
            High-level view of balances, budgets and recent activity.
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="text-sm font-medium">Next steps</div>
          <div className="mt-1 text-xs text-zinc-400">
            Add accounts, create a budget, and start tracking transactions.
          </div>
        </div>
      </div>
    </div>
  )
}


