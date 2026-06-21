import { S3Client } from '@aws-sdk/client-s3'
import { getEnv } from '../config/env.js';

const env = getEnv();


export const r2 = new S3Client({
  region: 'auto', // R2 ignores region but the SDK requires the field
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

export const R2_BUCKET = env.R2_BUCKET
