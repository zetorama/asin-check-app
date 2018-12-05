import { MongoClient, Db } from 'mongodb'

const DB_URI = process.env.DB_URI || ''
export const DB_NAME = process.env.DB_NAME || 'asin'
export const COL_PRODUCTS = 'products'

if (!DB_URI) {
    throw new Error('Unknown DB_URI — setup ENV variables!')
}

let client: MongoClient

export async function getDb(name: string = DB_NAME): Promise<Db> {
    if (client && client.isConnected()) {
        return client.db(name)
    }

    console.log('Initializing MongoClient…')
    client = new MongoClient(DB_URI)
    await client.connect()
    console.log('Connected to Mongo')

    return client.db(name)
}
