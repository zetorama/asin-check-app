import { Handler } from 'aws-lambda'

import { ProductAsin, ProductSnapshot as Product } from '../models/Product'
import { refreshProducts } from './lib/services'

export interface RefreshInput {
    asins: ProductAsin[]
}
export type RefreshOutput = Product[]

export const handler: Handler = async (event, context, callback) => {
    const { asins } = JSON.parse(event.body) as RefreshInput

    if (!asins) {
        return callback(null, {
            statusCode: 404,
            body: '',
        })
    }

    try {
        const result: RefreshOutput = await refreshProducts(asins)
        callback(null, {
            statusCode: 200,
            body: JSON.stringify(result),
        })
    } catch (err) {
        callback(err, {
            statusCode: 500,
            body: JSON.stringify(err),
        })
    }
}
