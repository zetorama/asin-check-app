import { ProductAsin, ProductSnapshot as Product } from '../../models/Product'
import { ProductStatus } from '../../models/ProductStatus'
import { fetchProduct, parseProduct } from './grabber'
import { getDb, COL_PRODUCTS } from './db'

export async function lookupProducts(asins: ProductAsin[]): Promise<Product[]> {
    if (!asins.length) return []

    const db = await getDb()
    const col = db.collection(COL_PRODUCTS)

    console.log(`lookupProducts: Trying to find ${asins.length} entries…`)
    const result = await col.find({
        asin: { $in: asins },
    })
    console.log(`lookupProducts: Find result`, await result.count())

    const products: Product[] = await result.toArray()
    console.log(`lookupProducts: Found ${products.length} product(s)`)

    // Fix the order and plug "new" products
    return asins.map((asin) => {
        return (
            products.find((p) => p.asin === asin) || {
                asin,
                status: ProductStatus.New,
            }
        )
    })
}

export async function scheduleProductsRefresh(asins: ProductAsin[]): Promise<Product[]> {
    if (!asins.length) return []

    const products: Product[] = []

    const db = await getDb()
    const col = db.collection(COL_PRODUCTS)
    const bulk = col.initializeUnorderedBulkOp()
    for (const asin of asins) {
        const product: Product = {
            asin,
            status: ProductStatus.InQueue,
            updatedOn: new Date().toISOString(),
        }
        const $setOnInsert: Partial<Product> = {
            createdOn: new Date().toISOString(),
        }

        bulk.find({ asin })
            .upsert()
            .updateOne({
                $set: product,
                $setOnInsert,
            })
        products.push(product)
    }

    console.log(`scheduleProductsRefresh: Executing bulk update of ${asins.length} entries…`)
    // NOTE: are we sure we don't need to read an actual data after bulk?
    const result = await bulk.execute()
    console.log('scheduleProductsRefresh: Bulk result', result.getUpsertedIds())

    // immitating queue: call refresh, but don't wait for it — assuming, they'd be updated at some later point
    refreshProducts(asins)

    return products
}

export async function refreshProducts(asins: ProductAsin[]): Promise<Product[]> {
    // NOTE: or is it better to save each one separately, so if grabbing for one would fail, others would be saved?…
    const products: Product[] = await Promise.all(asins.map(grabProduct))
    const db = await getDb()
    const col = db.collection(COL_PRODUCTS)
    const bulk = col.initializeUnorderedBulkOp()
    for (const product of products) {
        const $setOnInsert: Partial<Product> = {
            createdOn: new Date().toISOString(),
        }

        bulk.find({ asin: product.asin })
            .upsert()
            .updateOne({
                $set: product,
                $setOnInsert,
            })
    }

    console.log(`refreshProducts: Executing bulk update of ${asins.length} entries…`)
    // NOTE: are we sure we don't need to read an actual data after bulk?
    const result = await bulk.execute()
    console.log('refreshProducts: Bulk result', result.getUpsertedIds())

    return products
}

export async function grabProduct(asin: ProductAsin): Promise<Product> {
    console.log(`grabProduct: Grabbing ${asin}…`)
    // TODO: implement timeouts
    const res = await fetchProduct(asin)
    const html = await res.text()
    if (!res.ok) {
        console.error(`grabProduct: Grab ${asin} faild with statusCode = ${res.status} (${res.statusText})`)
        console.error(String(html || '').substr(0, 500))
        return {
            asin,
            status: res.status === 404 ? ProductStatus.Nomatch : ProductStatus.Fail,
        }
    }

    const data = await parseProduct(html)
    console.log(`grabProduct: Grab is done for ${asin}`, data.title)
    return {
        asin,
        data,
        status: ProductStatus.Success,
        updatedOn: new Date().toISOString(),
    }
}
