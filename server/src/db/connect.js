import mongoose from 'mongoose'

export async function connectToMongo(mongodbUri) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(mongodbUri)
  return mongoose.connection
}

