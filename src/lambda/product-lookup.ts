import { Handler } from 'aws-lambda'
import { ProductAsin, ProductSnapshot as Product } from '../models/Product'
import { ProductStatus } from '../models/ProductStatus'
import { lookupProducts, scheduleProductsRefresh } from './lib/services'

export interface LookupInput {
    asins: ProductAsin[]
    skipRefresh?: boolean
}
export type LookupOutput = Product[]

const isNew = (product: Product): boolean => product.status === ProductStatus.New

export const handler: Handler = async (event, context, callback) => {
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
    context.callbackWaitsForEmptyEventLoop = false
    const { asins = [], skipRefresh = false } = event.body ? JSON.parse(event.body) : ({} as LookupInput)
    let products: LookupOutput = []

    if (!asins || !asins.length) {
        return callback(null, {
            statusCode: 404,
            body: JSON.stringify(products),
        })
    }

    try {
        products = await lookupProducts(asins)
        if (!skipRefresh) {
            const refreshAsins = products.filter(isNew).map((p) => p.asin)
            const refreshing = await scheduleProductsRefresh(refreshAsins)

            if (refreshing.length) {
                for (const product of products) {
                    if (!isNew(product)) continue

                    const scheduled = refreshing.find((p) => p.asin === product.asin)
                    Object.assign(product, scheduled)
                }
            }
        }

        callback(null, {
            statusCode: 200,
            body: JSON.stringify(products),
        })
    } catch (err) {
        callback(err, {
            statusCode: 500,
            body: JSON.stringify(err),
        })
    }
}
