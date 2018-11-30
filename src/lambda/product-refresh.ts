import { Handler } from './lib/lamda-handler'
import { grabProduct } from './lib/grabber'

// NOTE: nelify library doesn't compile with next import:
// import {ProductSnapshot, ProductStatus} from '../models/Product'
// So, immitate
interface ProductSnapshot {
    asin: string
    status: 'init' | 'queue' | 'fetch' | 'success' | 'nomatch' | 'timeout' | 'fail'
}

export type RefreshOutput = ProductSnapshot
export interface RefreshInput {
    asin: string
}

export const handler: Handler = async (event, context, callback) => {
    const { asin } = JSON.parse(event.body) as RefreshInput

    if (!asin) {
        return callback(null, {
            statusCode: 404,
            body: '',
        })
    }

    try {
        const result: RefreshOutput = await grabProduct(asin)
        callback(null, {
            statusCode: 200,
            body: JSON.stringify(result),
        })
    } catch (err) {
        callback(err, {
            statusCode: 200,
            body: JSON.stringify(err),
        })
    }
}
