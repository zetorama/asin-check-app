import { getParent, types, Instance, SnapshotIn } from 'mobx-state-tree'

import { StoreModel } from './Store'

export enum ProductStatus {
    Init = 'init',
    Queue = 'queue',
    Success = 'success',
    Nomatch = 'nomatch',
    Timeout = 'timeout',
    Fail = 'fail',
}

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

        createdOn: types.maybe(types.Date),
        updatedOn: types.maybe(types.Date),
        isViewed: false,
    })
    .views((self) => ({
        get isLoading(): boolean {
            return self.status === ProductStatus.Init || self.status === ProductStatus.Queue
        },
        get isCurrentlyViewing(): boolean {
            // assumming, parent has an `activeProduct` as a ref
            return getParent<StoreModel>(self, 2).viewingProduct === self
        },
    }))
    .actions((self) => ({
        toggleViewed(setAsViewed: boolean = !self.isViewed) {
            self.isViewed = setAsViewed
        },
    }))

export default Product
