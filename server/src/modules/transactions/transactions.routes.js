import { Router } from 'express'
import multer from 'multer'

import {
  deleteTransaction,
  getAttachmentSignedUrl,
  getTransactionById,
  getTransactions,
  patchTransaction,
  postTransaction,
  postTransactionAttachment,
} from './transactions.controller.js'
import { protectRoute } from '../../middlewares/protectRoute.js'

// In-memory storage so we can pipe the buffer straight to sharp + R2 without
// touching the local disk. 5 MB cap matches the controller's validation.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const transactionsRouter = Router()

transactionsRouter.use(protectRoute)
transactionsRouter.get('/', getTransactions)
transactionsRouter.get('/:id', getTransactionById)
transactionsRouter.post('/', postTransaction)
transactionsRouter.patch('/:id', patchTransaction)
transactionsRouter.delete('/:id', deleteTransaction)
transactionsRouter.post(
  '/:id/attachments',
  upload.single('file'),
  postTransactionAttachment,
)
transactionsRouter.get('/:id/attachments/url', getAttachmentSignedUrl)


