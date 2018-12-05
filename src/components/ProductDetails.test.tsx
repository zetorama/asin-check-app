import * as React from 'react'
import { shallow } from 'enzyme'

import { ProductDetails } from './ProductDetails'
import { Product, ProductStatus } from '../models'

describe('ProductDetails', () => {
    it('renders with empty product', () => {
        const product = Product.create({
            asin: 'XXX',
            status: ProductStatus.Fail,
        })
        const cmp = shallow(<ProductDetails product={product} />)

        expect(cmp).toMatchSnapshot()
    })

    it('renders with full product', () => {
        const product = Product.create({
            asin: 'XXX',
            status: ProductStatus.Success,
            data: {
                title: 'xxx aaa',
                categories: ['xxx', 'aaa'],
                dimensions: '1 x 2 x 3',
                rank: ['1', '2', '3'],
                rating: 'ok',
            },
        })
        const cmp = shallow(<ProductDetails product={product} />)

        expect(cmp).toMatchSnapshot()
    })

    it('renders with refresh button', () => {
        const cb = jest.fn()
        const product = Product.create({
            asin: 'XXX',
            status: ProductStatus.Success,
        })
        const cmp = shallow(<ProductDetails product={product} onRefresh={cb} />)

        expect(cmp).toMatchSnapshot()
    })

    it('calls refresh callback', () => {
        const cb = jest.fn()
        const product = Product.create({
            asin: 'XXX',
            status: ProductStatus.Success,
        })
        const cmp = shallow(<ProductDetails product={product} onRefresh={cb} />)

        cmp.find('.details-refresh').simulate('click')
        expect(cb).toHaveBeenCalledTimes(1)
        expect(cb.mock.calls[0][1]).toHaveProperty('asin', 'XXX')
    })
})
