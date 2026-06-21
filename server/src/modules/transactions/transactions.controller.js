import { randomUUID } from 'crypto'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

import { AppError } from '../../lib/AppError.js'
import { r2, R2_BUCKET } from '../../lib/r2.js'
import { Transaction } from './transactions.model.js'
import {
  CreateTransactionSchema,
  ListTransactionsQuerySchema,
  UpdateTransactionSchema,
} from './transactions.schema.js'
import {
  createTransaction,
  deleteTransaction as deleteTransactionService,
  listTransactions,
  updateTransaction,
} from './transactions.service.js'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/** Make the filename URL-safe (no spaces, weird chars) and length-bounded. */
function sanitizeFilename(name) {
  return name
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

export async function getTransactions(req, res) {
  const query = ListTransactionsQuerySchema.parse(req.query)
  const result = await listTransactions(req.user.id, query)
  res.json({ ok: true, ...result })
}

export async function getTransactionById(req, res) {
  const tx = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user.id,
  })
    .populate('categoryId', 'name color icon')
    .lean()

  if (!tx) {
    throw new AppError('Transaction not found', {
      status: 404,
      code: 'TRANSACTION_NOT_FOUND',
    })
  }

  // Sign each attachment so the detail page can render thumbnails directly.
  const attachments = await Promise.all(
    (tx.attachments ?? []).map(async (a) => ({
      ...a,
      viewUrl: await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: R2_BUCKET,
          Key: a.key,
          ResponseContentDisposition: `inline; filename="${a.filename}"`,
          ResponseContentType: a.contentType,
        }),
        { expiresIn: 3600 }, // 1 hour, matches list endpoint policy
      ),
    })),
  )

  res.json({ ok: true, data: { ...tx, attachments } })
}

export async function postTransaction(req, res) {
  const input = CreateTransactionSchema.parse(req.body)
  const data = await createTransaction({userId:req.user.id, ...input})
  res.status(201).json({ ok: true, data })
}

export async function patchTransaction(req, res) {
  const input = UpdateTransactionSchema.parse(req.body)
  const data = await updateTransaction({
    userId: req.user.id,
    transactionId: req.params.id,
    input,
  })
  res.json({ ok: true, data })
}


export async function deleteTransaction(req, res) {
  await deleteTransactionService({
    userId: req.user.id,
    transactionId: req.params.id,
  })
  res.status(204).end()
}

/**
 * POST /transactions/:id/attachments
 * multer middleware puts the file on `req.file`. We validate, process images
 * with sharp, upload to R2, and push the attachment record onto the transaction.
 */
export async function postTransactionAttachment(req, res) {
  const file = req.file
  if (!file) {
    throw new AppError('No file uploaded', {
      status: 400,
      code: 'NO_FILE',
    })
  }
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    throw new AppError(`Unsupported file type: ${file.mimetype}`, {
      status: 415,
      code: 'UNSUPPORTED_TYPE',
    })
  }
  if (file.size > MAX_BYTES) {
    throw new AppError('File exceeds 5 MB limit', {
      status: 413,
      code: 'FILE_TOO_LARGE',
    })
  }

  // Ownership check: 404 if the transaction doesn't exist OR isn't this user's.
  const tx = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user.id,
  })
  if (!tx) {
    throw new AppError('Transaction not found', {
      status: 404,
      code: 'TRANSACTION_NOT_FOUND',
    })
  }

  // Image pipeline: strip EXIF (privacy), auto-orient, downscale.
  // For PDFs: pass through unchanged.
  let buffer = file.buffer
  let width
  let height
  if (file.mimetype.startsWith('image/')) {
    const pipeline = sharp(file.buffer)
      .rotate()
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .withMetadata({ exif: {} })
    buffer = await pipeline.toBuffer()
    const meta = await sharp(buffer).metadata()
    width = meta.width
    height = meta.height
  }

  const safeName = sanitizeFilename(file.originalname || 'file')
  const key = `attachments/${req.user.id}/${randomUUID()}-${safeName}`

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
    }),
  )

  const attachment = {
    key,
    contentType: file.mimetype,
    size: buffer.length,
    filename: safeName,
    width,
    height,
    uploadedAt: new Date(),
  }

  tx.attachments.push(attachment)
  await tx.save()

  res.status(201).json({ ok: true, data: attachment })
}

/**
 * GET /transactions/:id/attachments/url?key=<key>
 * Returns a short-lived signed URL the browser can use as <img src> / window.open().
 * Each call generates a fresh URL — they expire in 5 minutes.
 */
export async function getAttachmentSignedUrl(req, res) {
  const { key } = req.query
  if (!key) {
    throw new AppError('Missing "key" query param', {
      status: 400,
      code: 'KEY_REQUIRED',
    })
  }

  // Ownership check: the key must belong to a transaction the user owns.
  const tx = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user.id,
    'attachments.key': key,
  })
  if (!tx) {
    throw new AppError('Attachment not found', {
      status: 404,
      code: 'ATTACHMENT_NOT_FOUND',
    })
  }

  const attachment = tx.attachments.find((a) => a.key === key)

  const url = await getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      // "inline" tells the browser to render, not download. Set the right
      // filename for users who do hit Save As.
      ResponseContentDisposition: `inline; filename="${attachment.filename}"`,
      ResponseContentType: attachment.contentType,
    }),
    { expiresIn: 300 }, // 5 minutes
  )

  res.json({ ok: true, data: { url, expiresIn: 300 } })
}

