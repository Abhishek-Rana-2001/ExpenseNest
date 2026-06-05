import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../users/user.model.js', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('../../config/env.js', () => ({
  getEnv: () => ({
    JWT_ACCESS_SECRET: 'test-access-secret-long',
    JWT_REFRESH_SECRET: 'test-refresh-secret-long',
  }),
}))

import { User } from '../users/user.model.js'
import { registerUser, loginUser } from './auth.service.js'

// findOne is always chained with .lean() in the service, so we mock the chain
function mockFindOne(returnValue) {
  User.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(returnValue) })
}

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws EMAIL_TAKEN when email already exists', async () => {
    mockFindOne({ email: 'a@b.com' })

    await expect(
      registerUser({ email: 'a@b.com', password: 'pass123', name: 'Ada' }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN', status: 409 })
  })

  it('returns accessToken and refreshToken on success', async () => {
    mockFindOne(null)
    User.create.mockResolvedValue({ _id: 'abc123', email: 'a@b.com', tokenVersion: 0 })

    const result = await registerUser({ email: 'a@b.com', password: 'pass123', name: 'Ada' })

    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
    expect(result.user._id).toBe('abc123')
  })
})

describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws INVALID_CREDENTIALS when user is not found', async () => {
    // loginUser calls findOne without .lean(), so mockResolvedValue works directly
    User.findOne.mockResolvedValue(null)

    await expect(
      loginUser({ email: 'ghost@test.com', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
  })
})
