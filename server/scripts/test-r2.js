import 'dotenv/config'
console.log('cwd:', process.cwd())
console.log('R2_BUCKET:', process.env.R2_BUCKET)
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET } from '../src/lib/r2.js'

async function run() {
  const key = `_test/${Date.now()}.txt`
  const body = 'hello from r2'

  console.log(`Uploading to ${R2_BUCKET}/${key}…`)
  await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body }))
  console.log('  ✓ upload ok')

  console.log('Downloading…')
  const res = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
  const text = await res.Body.transformToString()
  console.log(`  ✓ got back: ${text}`)

  console.log('Deleting…')
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
  console.log('  ✓ delete ok')

  console.log('R2 setup is working.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
