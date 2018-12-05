import { LookupInput, LookupOutput } from '../lambda/product-lookup'
import { RefreshInput, RefreshOutput } from '../lambda/product-refresh'

import { ProductSnapshot as Product, ProductAsin } from '../models/Product'
import { func } from 'prop-types'

export type LambdaName = 'product-lookup' | 'product-refresh'

const LOCALSTORAGE_PRODUCTS_KEY = 'ASIN_PRODUCTS_LOG'

const activeFetches: { [id: string]: Promise<any> } = {}

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

export async function fetchLambda<I, O>(name: LambdaName, data?: I): Promise<O | undefined> {
    const body = data ? JSON.stringify(data) : undefined
    const fetchId = `${name}::${body}`

    if (!activeFetches[fetchId]) {
        const uri = `/.netlify/functions/${name}`
        activeFetches[fetchId] = fetchJson(uri, body)
        activeFetches[fetchId].then(() => delete activeFetches[fetchId])
    }

    return activeFetches[fetchId]
}

export async function fetchJson(
    url: string,
    body: string | undefined,
    method: string = body ? 'POST' : 'GET',
): Promise<object | undefined> {
    const response = await fetch(url, {
        body,
        method,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
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
