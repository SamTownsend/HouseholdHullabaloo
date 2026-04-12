import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.DB_NAME || 'householdhullabaloo'

let db: Db

export async function connectToDatabase(): Promise<Db> {
  const client = new MongoClient(uri)
  await client.connect()
  db = client.db(dbName)
  console.log(`Connected to MongoDB: ${dbName}`)
  return db
}

export function getDb(): Db {
  if (!db) throw new Error('Database not initialized. Call connectToDatabase first.')
  return db
}
