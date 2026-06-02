import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/quiz-creator"

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache | undefined
}

const cached = global.mongoose || { conn: null, promise: null }
if (!global.mongoose) global.mongoose = cached

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongo) => {
      cached.conn = mongo
      return mongo
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect
