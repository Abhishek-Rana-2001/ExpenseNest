import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { router } from './router'
import ReactLenis from 'lenis/react'

function App() {
  return (
    <AuthProvider>
       <ReactLenis root />
      <div className="min-h-screen bg-background text-foreground">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  )
}

export default App
