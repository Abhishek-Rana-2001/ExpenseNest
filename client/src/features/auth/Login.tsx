import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { PieChart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import { loginSchema, type LoginInput } from './schema'
import { useEffect } from 'react'

export default function Login() {
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    setFocus('email')
  }, [setFocus])


  async function onSubmit(data: LoginInput) {
    try {
      await login(data.email, data.password)
      navigate('/app/dashboard', { replace: true })
    } catch {
      // error shown via context
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg rounded-2xl p-10">
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <PieChart className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">ExpenseNest</span>
          </div>
          <p className="text-sm text-slate-600 max-w-[24rem]">
            Sign in to access your dashboard, manage your budget, and track your spending.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                key="login-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                layout="position"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
                role="alert"
              >
                <div className="flex items-start justify-between gap-3">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              {...register('email')}
            />
            <AnimatePresence initial={false}>
              {errors.email && (
                <motion.p
                  key="login-email-error"
                  layoutId="login-email-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              {...register('password')}
            />
            <AnimatePresence initial={false}>
              {errors.password && (
                <motion.p
                  key="login-password-error"
                  layoutId="login-password-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
