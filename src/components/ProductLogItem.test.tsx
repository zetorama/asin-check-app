import * as React from 'react'
import { shallow } from 'enzyme'

import { ProductLogItem } from './ProductLogItem'
import { Product, ProductStatus } from '../models'

describe('ProductLogItem', () => {
    it('renders with empty store', () => {
        const product = Product.create({
            asin: 'XXX',
            status: ProductStatus.Fail,
        })
        const cmp = shallow(<ProductLogItem product={product} />)

        expect(cmp).toMatchSnapshot()
    })

    it('calls click callback', () => {
        const cb = jest.fn()
        const product = Product.create({
            asin: 'XXX',
            status: ProductStatus.Success,
        })
        const cmp = shallow(<ProductLogItem product={product} onClick={cb} />)

        cmp.find('.clicky')
            .at(0)
            .simulate('click')
        expect(cb).toHaveBeenCalledTimes(1)
        expect(cb.mock.calls[0][1]).toBe('XXX')
    })
})
