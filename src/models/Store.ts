import { types, getParent, getSnapshot, applySnapshot, Instance, SnapshotIn } from 'mobx-state-tree'

import { fetchProductsLog, saveProductsLog, fetchProductsByAsins, refreshProductsByAsins } from '../services/product'
import { Product, ProductAsin, ProductModel, ProductStatus, ProductSnapshot } from './Product'

export const PRODUCTS_LIMIT = 12

export type StoreModel = Instance<typeof Store>
export type StoreSnapshot = SnapshotIn<typeof Store>

type Void<T> = { [P in keyof T]?: undefined }

const resetObj = <T>(source: T): Void<T> =>
    Object.keys(source).reduce((all, one) => Object.assign(all, { [one]: undefined }), {})

export const ProductInStore = types.compose(
    Product,
    types.model('ProductInStore').views((self) => ({
        get isCurrentlyViewing(): boolean {
            // assumming, parent has an `activeProduct` as a ref
            return getParent<StoreModel>(self, 2).viewingProduct === self
        },
    })),
)

export type ProductInStoreModel = Instance<typeof ProductInStore>
export type ProductInStoreSnapshot = SnapshotIn<typeof ProductInStore>

export const Store = types
    .model('AppStore', {
        version: '0.0.0',
        products: types.array(ProductInStore),
        viewingProduct: types.maybe(types.reference(ProductInStore)),
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

                    if (product === self.viewingProduct) {
                        // Mark as seen, as its currently opened
                        product.toggleViewed(true)
                    }
                }
            }
        },
        createProduct(asin: ProductAsin): ProductInStoreModel {
            const product = self.getProduct(asin)
            const defaults = product ? getSnapshot(product) : undefined
            return ProductInStore.create({
                ...defaults,
                asin,
                status: ProductStatus.New,
            })
        },
        addProducts(products: ProductModel[]) {
            if (!products || !Array.isArray(products) || !products.length) return

            const oldProducts = self.products.filter((p1) => !products.find((p2) => p1.asin === p2.asin))
            const newProducts: ProductInStoreModel[] = products.concat(oldProducts).slice(0, PRODUCTS_LIMIT)
            self.products.replace(newProducts)
        },
        clearLookingUpValue() {
            self.lookingUpValue = ''
        },
        viewProduct(product?: ProductModel | ProductAsin) {
            self.viewingProduct = product
                ? self.getProduct(ProductInStore.is(product) ? product.asin : product)
                : undefined
            if (self.viewingProduct && !self.viewingProduct.isViewed) {
                self.viewingProduct.toggleViewed(true)
            }
        },
    }))
    .actions((self) => ({
        saveProductsLog() {
            saveProductsLog(getSnapshot(self.products))
        },
        async fetchProductsLog() {
            const products = (await fetchProductsLog()) as ProductModel[]
            products && products.length && self.addProducts(products)
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

                // switch to a newly added product
                self.viewProduct(self.products[0])
                self.clearLookingUpValue()
            }
        },
        async fetchUpdates(asins: ProductAsin[] = self.loadingProducts.map((p) => p.asin)) {
            const update = await fetchProductsByAsins(asins)
            update && self.mergeUpdates(update)
        },
        async refreshProducts(asins: ProductAsin[]) {
            for (const asin of asins) {
                const product = self.getProduct(asin)
                product && product.setStatus(ProductStatus.InQueue)
            }
            const update = await refreshProductsByAsins(asins)
            update && self.mergeUpdates(update)
        },
    }))

export default Store
