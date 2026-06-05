import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { router } from './router'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
       <Toaster />
        <div className="min-h-screen bg-gray-50 text-foreground">
          <RouterProvider router={router} />
        </div>
    </AuthProvider>
  )
}

export default App
