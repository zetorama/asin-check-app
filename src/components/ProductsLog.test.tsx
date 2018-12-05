import * as React from 'react'
import { shallow } from 'enzyme'

import { ProductsLog } from './ProductsLog'
import { createStore, ProductStatus } from '../models'

describe('ProductsLog', () => {
    it('renders with empty store', () => {
        const store = createStore()
        const cmp = shallow(<ProductsLog store={store} />)

        expect(cmp).toMatchSnapshot()
    })

    it('renders with one product', () => {
        const store = createStore({
            products: [
                {
                    asin: 'XXX',
                    status: ProductStatus.Success,
                },
            ],
        })
        const cmp = shallow(<ProductsLog store={store} />)

        expect(cmp).toMatchSnapshot()
    })
})
