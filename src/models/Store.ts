import { types, getSnapshot, applySnapshot, Instance, SnapshotIn } from 'mobx-state-tree'

import { Product, ProductAsin, ProductModel, ProductStatus, ProductSnapshot } from './Product'

import { LookupInput, LookupOutput } from '../lambda/product-lookup'
import { RefreshInput, RefreshOutput } from '../lambda/product-refresh'

const LOCALSTORAGE_PRODUCTS_KEY = 'ASIN_PRODUCTS_LOG'
const PRODUCTS_LIMIT = 12

export type StoreModel = Instance<typeof Store>
export type StoreSnapshot = SnapshotIn<typeof Store>

type Void<T> = { [P in keyof T]?: undefined }

const resetObj = <T>(source: T): Void<T> =>
    Object.keys(source).reduce((all, one) => Object.assign(all, { [one]: undefined }), {})

export const Store = types
    .model('AppStore', {
        version: '0.0.0',
        products: types.array(Product),
        viewingProduct: types.maybe(types.reference(Product)),
        lookingUpValue: types.optional(types.string, ''),
    })
    .views((self) => ({
        get loadingProducts(): ProductModel[] {
            return self.products.filter((p) => p.isLoading)
        },
        getProduct(asin: ProductAsin): ProductModel | undefined {
            return self.products.find((p) => p.asin === asin)
        },
    }))
    .actions((self) => ({
        mergeUpdates(products: ProductSnapshot[]) {
            // Update only existed items, keeping the order
            for (const update of products) {
                const product = self.getProduct(update.asin)
                if (product) {
                    applySnapshot(product, Object.assign(resetObj(product), update))
                }
            }
        },
        createProduct(asin: ProductAsin): ProductModel {
            const product = self.getProduct(asin)
            const defaults = product ? getSnapshot(product) : undefined
            return Product.create({
                ...defaults,
                asin,
                status: ProductStatus.Init,
            })
        },
        addProducts(products: ProductModel[]) {
            if (!products || !Array.isArray(products) || !products.length) return

            const oldProducts = self.products.filter((p1) => !products.find((p2) => p1.asin === p2.asin))
            const newProducts = products.concat(oldProducts).slice(0, PRODUCTS_LIMIT)
            self.products.replace(newProducts)
        },
        clearLookingUpValue() {
            self.lookingUpValue = ''
        },
        viewProduct(product: ProductModel | ProductAsin) {
            self.viewingProduct = self.getProduct(Product.is(product) ? product.asin : product)
            if (self.viewingProduct && !self.viewingProduct.isViewed) {
                self.viewingProduct.toggleViewed(true)
            }
        },
    }))
    .actions((self) => ({
        saveProductsLog() {
            window.localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY, JSON.stringify(getSnapshot(self.products)))
        },
        async fetchProductsLog() {
            const raw = window.localStorage.getItem(LOCALSTORAGE_PRODUCTS_KEY)
            if (!raw) return

            try {
                self.products.replace(JSON.parse(raw))
            } catch (err) {
                console.error(`Cannot parse ${LOCALSTORAGE_PRODUCTS_KEY} from localStorage`, err)
                window.localStorage.removeItem(LOCALSTORAGE_PRODUCTS_KEY)
            }
        },
        async lookup(value: string) {
            self.lookingUpValue = String(value || '')

            if (self.lookingUpValue) {
                const asins = self.lookingUpValue.split(/\W+/)
                const products = asins
                    .filter((asin, index) => asin && asins.indexOf(asin) === index)
                    .map((asin) => self.createProduct(asin))

                self.viewingProduct = undefined
                await self.addProducts(products)
                self.viewProduct(self.products[0])
                self.clearLookingUpValue()
            }
        },
        async fetchUpdates(asins: ProductAsin[] = self.loadingProducts.map((p) => p.asin)) {
            const body: LookupInput = { asins }
            const response = await fetch('/.netlify/functions/product-lookup', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                console.error(`Failed refreshLog()`, body)
                console.error(response.status, response.statusText, await response.text())
                // no recover
                return
            }

            const update: LookupOutput = await response.json()
            self.mergeUpdates(update as ProductSnapshot[])

            // TODO: server should call for refresh by itself
            for (const product of update) {
                if (product.status === ProductStatus.Queue) {
                    ;(self as StoreModel).refreshProduct(product as ProductSnapshot)
                }
            }
        },
        async refreshProduct(product: ProductSnapshot) {
            const body: RefreshInput = { asin: product.asin }
            const response = await fetch('/.netlify/functions/product-refresh', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                console.error(`Failed refreshProduct()`, body)
                console.error(response.status, response.statusText, await response.text())
                // no recover
                return
            }

            const update: RefreshOutput = await response.json()
            self.mergeUpdates([update] as ProductSnapshot[])
        },
    }))

export default Store
