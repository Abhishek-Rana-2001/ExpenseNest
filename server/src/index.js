import 'dotenv/config'

import { createApp } from './app.js'
import { getEnv } from './config/env.js'
import { connectToMongo } from './db/connect.js'

async function main() {
  const env = getEnv()

  if (env.MONGODB_URI) {
    await connectToMongo(env.MONGODB_URI)
    // eslint-disable-next-line no-console
    console.log('MongoDB connected')
  } else {
    // eslint-disable-next-line no-console
    console.log('MONGODB_URI not set (skipping Mongo connection)')
  }

  const app = createApp()
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exitCode = 1
})

