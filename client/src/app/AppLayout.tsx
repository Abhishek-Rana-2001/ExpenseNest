import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'



export function AppLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* <Header /> */}
      <main className="w-full h-full">
        <Outlet />
      </main>
    </div>
  )
}
