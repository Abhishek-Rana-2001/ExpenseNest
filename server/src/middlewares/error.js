// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Zod error
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: err.issues,
      },
    })
  }

  // Mongoose validation / cast / duplicate key
  if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Invalid data',
        code: 'INVALID_DATA',
        details: err.message,
      },
    })
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      ok: false,
      error: {
        message: 'Duplicate key',
        code: 'DUPLICATE_KEY',
        details: err.keyValue,
      },
    })
  }

  const status = typeof err?.status === 'number' ? err.status : 500
  const code = typeof err?.code === 'string' ? err.code : 'INTERNAL_ERROR'
  const message =
    typeof err?.message === 'string' ? err.message : 'Internal Server Error'

  // eslint-disable-next-line no-console
  console.error(err)

  res.status(status).json({
    ok: false,
    error: {
      message,
      code,
    },
  })
}

