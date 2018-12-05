import { types, Instance, SnapshotIn } from 'mobx-state-tree'

import ProductStatus from './ProductStatus'

export { ProductStatus }

export type ProductDetailsModel = Instance<typeof ProductDetails>
export type ProductDetailsSnapshot = SnapshotIn<typeof ProductDetails>

export const ProductDetails = types.model('ProductDetails', {
    title: types.string,
    categories: types.array(types.string),
    dimensions: types.maybe(types.string),
    rank: types.maybe(types.array(types.string)),
    rating: types.maybe(types.string),
})

export type ProductAsin = string

export type ProductModel = Instance<typeof Product>
export type ProductSnapshot = SnapshotIn<typeof Product>

export const Product = types
    .model('Product', {
        asin: types.identifier,
        status: types.enumeration<ProductStatus>('ProductStatus', Object.values(ProductStatus)),
        data: types.maybe(types.frozen(ProductDetails)),

        createdOn: types.maybe(types.string),
        updatedOn: types.maybe(types.string),
        isViewed: false,
    })
    .views((self) => ({
        // NOTE: an "abstract" method to simplify typings (see implementation in './Store')
        get isCurrentlyViewing(): boolean {
            return false
        },
        get createdDateTime(): string {
            if (!self.createdOn) return ''

            const date = new Date(self.createdOn)
            return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
        },
        get updatedDateTime(): string {
            if (!self.updatedOn) return ''

            const date = new Date(self.updatedOn)
            return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
        },
        get isLoading(): boolean {
            return (
                self.status === ProductStatus.New ||
                self.status === ProductStatus.InQueue ||
                self.status === ProductStatus.Refreshing
            )
        },
    }))
    .actions((self) => ({
        toggleViewed(setAsViewed: boolean = !self.isViewed) {
            self.isViewed = setAsViewed
        },
        setStatus(status: ProductStatus) {
            self.status = status
        },
    }))

export default Product
