import * as React from 'react'
import { shallow } from 'enzyme'

import { App } from './App'
import { createStore, ProductStatus } from './models'

describe('App', () => {
    it('renders with empty store', () => {
        const store = createStore()
        const cmp = shallow(<App store={store} />)

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
        const cmp = shallow(<App store={store} />)

        expect(cmp).toMatchSnapshot()
    })
})
