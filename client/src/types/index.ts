export type User = {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  emailVerified: boolean
  picture?: string
  passwordHash?: string
  googleSub?: string
  tokenVersion?: number
}
