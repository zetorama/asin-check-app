import { LookupInput, LookupOutput } from '../lambda/product-lookup'
import { RefreshInput, RefreshOutput } from '../lambda/product-refresh'

import { ProductSnapshot as Product, ProductAsin } from '../models/Product'

export type LambdaName = 'product-lookup' | 'product-refresh'

const LOCALSTORAGE_PRODUCTS_KEY = 'ASIN_PRODUCTS_LOG'

export async function fetchProductsLog(): Promise<Product[] | undefined> {
    const raw = window.localStorage.getItem(LOCALSTORAGE_PRODUCTS_KEY)
    if (!raw) return undefined

    try {
        return JSON.parse(raw) as Product[]
    } catch (err) {
        console.error(`Cannot parse ${LOCALSTORAGE_PRODUCTS_KEY} from localStorage`, err)
        window.localStorage.removeItem(LOCALSTORAGE_PRODUCTS_KEY)

        return undefined
    }
}

export async function saveProductsLog(products: Product[]): Promise<void> {
    window.localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY, JSON.stringify(products))
}

export async function fetchProductsByAsins(asins: ProductAsin[]): Promise<Product[] | undefined> {
    return fetchLambda<LookupInput, LookupOutput>('product-lookup', { asins })
}

export async function refreshProductsByAsins(asins: ProductAsin[]): Promise<Product[] | undefined> {
    return fetchLambda<RefreshInput, RefreshOutput>('product-refresh', { asins })
}

export async function fetchLambda<I, O>(name: LambdaName, body?: I): Promise<O | undefined> {
    const response = await fetch(`/.netlify/functions/${name}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
        console.error(`Failed ${name} call`, body)
        console.error(response.status, response.statusText, await response.text())
        // no recover
        return undefined
    }

    try {
        return await response.json()
    } catch (err) {
        console.error(`Failed ${name} response parse`, err)
        // no recover
        return undefined
    }
}
