import { Handler } from './lib/lamda-handler'
// import {ProductSnapshot, ProductStatus} from '../models/Product'
interface ProductSnapshot {
    asin: string
    status: 'init' | 'queue' | 'fetch' | 'success' | 'nomatch' | 'timeout' | 'fail'
}

export type LookupOutput = ProductSnapshot[]
export interface LookupInput {
    asins: string[]
}

function getProductsByAsins(asins: LookupInput['asins']): ProductSnapshot[] {
    return asins.map((asin) => ({
        asin,
        // status: ProductStatus.Queue,
        status: 'nomatch' as ProductSnapshot['status'],
    }))
}

export const handler: Handler = (event, context, callback) => {
    const { asins = [] } = JSON.parse(event.body) as LookupInput
    const result: LookupOutput = []

    if (!asins) {
        return callback(null, {
            statusCode: 404,
            body: JSON.stringify(result),
        })
    }

    result.push(...getProductsByAsins(asins))

    callback(null, {
        statusCode: 200,
        body: JSON.stringify(result),
    })
}
