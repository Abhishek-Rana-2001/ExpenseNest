import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    handler: (_req, res) => {
        res.status(429).json({
            ok: false,
            error: {
                message: 'Too many login attempts, please try again later',
                code: 'TOO_MANY_LOGIN_ATTEMPTS',
            },
        })
    },
    legacyHeaders: false,
    standardHeaders: true
})


export const registerLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    handler: (_req, res) => {
        res.status(429).json({
            ok: false,
            error: {
                message: 'Too many register attempts, please try again later',
                code: 'TOO_MANY_REGISTER_ATTEMPTS',
            },
        })
    },
    legacyHeaders: false,
    standardHeaders: true
})


export const refreshLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    handler: (_req, res) => {
        res.status(429).json({
            ok: false,
            error: {
                message: 'Too many refresh attempts, please try again later',
                code: 'TOO_MANY_REFRESH_ATTEMPTS',
            },
        })
    },
    legacyHeaders: false,
    standardHeaders: true
})