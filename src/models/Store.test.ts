import { getSnapshot } from 'mobx-state-tree'
import { Store } from './Store'
import { Product, ProductStatus } from './Product'

describe('Store model', () => {
    it('creates an empty model', () => {
        const model = Store.create()

        expect(getSnapshot(model)).toMatchSnapshot()
    })

    it('creates model with two products', () => {
        const model = Store.create({
            products: [{ asin: 'aaa', status: ProductStatus.Success }, { asin: 'bbb', status: ProductStatus.Fail }],
        })

        expect(model.products.length).toBe(2)

        expect(getSnapshot(model)).toMatchSnapshot()
    })

    it('gets a product', () => {
        const model = Store.create({
            products: [{ asin: 'aaa', status: ProductStatus.Success }, { asin: 'bbb', status: ProductStatus.Fail }],
        })

        expect(model.getProduct('bbb')).toHaveProperty('asin', 'bbb')
        expect(model.getProduct('zzz')).toBe(undefined)
    })

    it('creates a product', () => {
        const model = Store.create()
        const product = model.createProduct('xxx')
        expect(product).toMatchSnapshot()
    })

    it('adds a product', () => {
        const model = Store.create()

        expect(model.products.length).toBe(0)
        model.addProducts([model.createProduct('xxx')])
        expect(model.products.length).toBe(1)

        expect(getSnapshot(model)).toMatchSnapshot()
    })

    it('merges updates of only existed products', () => {
        const model = Store.create({
            products: [{ asin: 'aaa', status: ProductStatus.Success }, { asin: 'bbb', status: ProductStatus.Fail }],
        })

        expect(model.products.length).toBe(2)
        model.mergeUpdates([
            { asin: 'zzz', status: ProductStatus.Refreshing },
            { asin: 'bbb', status: ProductStatus.Nomatch },
        ])

        expect(getSnapshot(model)).toMatchSnapshot()
    })

    it('switches viewing product', () => {
        const model = Store.create({
            products: [{ asin: 'aaa', status: ProductStatus.Success }, { asin: 'bbb', status: ProductStatus.Fail }],
        })

        expect(model.viewingProduct).toBe(undefined)
        model.viewProduct('aaa')
        expect(model.viewingProduct).toHaveProperty('asin', 'aaa')
        model.viewProduct('bbb')
        expect(model.viewingProduct).toHaveProperty('asin', 'bbb')
        model.viewProduct(undefined)
        expect(model.viewingProduct).toBe(undefined)
    })
})
