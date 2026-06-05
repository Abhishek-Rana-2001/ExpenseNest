import { describe, it, expect } from 'vitest'
import { AppError } from './AppError.js'

describe('AppError', () => {
  it('sets message, status, and code', () => {
    const err = new AppError('Email already in use', { status: 409, code: 'EMAIL_TAKEN' })

    expect(err.message).toBe('Email already in use')
    expect(err.status).toBe(409)
    expect(err.code).toBe('EMAIL_TAKEN')
  })

  it('defaults to status 500 when none is given', () => {
    const err = new AppError('Something broke')

    expect(err.status).toBe(500)
    expect(err.code).toBe('INTERNAL_ERROR')
  })

  it('is an instance of Error', () => {
    const err = new AppError('oops')
    expect(err).toBeInstanceOf(Error)
  })
})
