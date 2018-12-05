import { getSnapshot } from 'mobx-state-tree'
import { Product, ProductStatus } from './Product'

const dummyProduct = (status: ProductStatus = ProductStatus.Success) => ({
    asin: 'XXX',
    status,
    data: {
        title: 'xxx aaa',
        categories: ['xxx', 'aaa'],
        dimensions: '1 x 2 x 3',
        rank: ['1', '2', '3'],
        rating: 'ok',
    },
})

describe('Product model', () => {
    it('can create a model', () => {
        const model = Product.create(dummyProduct())

        expect(getSnapshot(model)).toMatchSnapshot()
    })

    it('switches status', () => {
        const model = Product.create(dummyProduct())
        model.setStatus(ProductStatus.Fail)
        expect(model.status).toBe(ProductStatus.Fail)
    })

    it('toggles viewed flag', () => {
        const model = Product.create(dummyProduct())
        expect(model.isViewed).toBe(false)
        model.toggleViewed()
        expect(model.isViewed).toBe(true)
        model.toggleViewed()
        expect(model.isViewed).toBe(false)
        model.toggleViewed(false)
        expect(model.isViewed).toBe(false)
        model.toggleViewed(true)
        expect(model.isViewed).toBe(true)
    })

    it('calculates loading flag', () => {
        const model = Product.create(dummyProduct(ProductStatus.New))
        expect(model.isLoading).toBe(true)
        model.setStatus(ProductStatus.InQueue)
        expect(model.isLoading).toBe(true)
        model.setStatus(ProductStatus.Refreshing)
        expect(model.isLoading).toBe(true)
        model.setStatus(ProductStatus.Success)
        expect(model.isLoading).toBe(false)
        model.setStatus(ProductStatus.Timeout)
        expect(model.isLoading).toBe(false)
        model.setStatus(ProductStatus.Nomatch)
        expect(model.isLoading).toBe(false)
        model.setStatus(ProductStatus.Fail)
        expect(model.isLoading).toBe(false)
        model.setStatus(ProductStatus.New)
        expect(model.isLoading).toBe(true)
    })
})
