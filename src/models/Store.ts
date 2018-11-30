import { types, getSnapshot, Instance, SnapshotIn } from 'mobx-state-tree'

import { Product, ProductAsin, ProductModel, ProductStatus } from './Product'

const LOCALSTORAGE_PRODUCTS_KEY = 'ASIN_PRODUCTS_LOG'
const PRODUCTS_LIMIT = 12

export type StoreModel = Instance<typeof Store>
export type StoreSnapshot = SnapshotIn<typeof Store>

export const Store = types
    .model('AppStore', {
        version: '0.0.0',
        products: types.array(Product),
        viewingProduct: types.maybe(types.reference(Product)),
        lookingUpValue: types.optional(types.string, ''),
    })
    .views((self) => ({
        getProduct(asin: ProductAsin): ProductModel | undefined {
            return self.products.find((p) => p.asin === asin)
        },
    }))
    .actions((self) => ({
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
            self.viewingProduct = Product.is(product) ? product : self.getProduct(product)
            if (self.viewingProduct) {
                self.viewingProduct.toggleViewed(true)
            }
        },
    }))
    .actions((self) => ({
        async fetchProductsLog() {
            const raw = window.localStorage.getItem(LOCALSTORAGE_PRODUCTS_KEY)
            if (!raw) return

            try {
                self.products = JSON.parse(raw)
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
    }))

export default Store
