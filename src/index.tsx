import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'
import 'bootstrap/dist/css/bootstrap.css'

import './index.css'
import App from './App'
import createStore, { ProductSnapshot, ProductStatus } from './models'

const products: ProductSnapshot[] = [
    {
        asin: 'YVPB06XWZW',
        createdOn: new Date(),
        status: ProductStatus.Queue,
    },
    {
        asin: 'ZWYVPB06XW',
        createdOn: new Date(),
        status: ProductStatus.Timeout,
    },
    {
        asin: 'ZWaaPB06XW',
        createdOn: new Date(),
        status: ProductStatus.Nomatch,
    },
    {
        asin: 'PB06XWZWYV',
        createdOn: new Date(),
        status: ProductStatus.Success,
        data: {
            title: 'Foo Bar',
            categories: [],
        },
        isViewed: true,
    },
    {
        asin: '6XWZWYVPB0',
        createdOn: new Date(),
        status: ProductStatus.Fail,
        isViewed: true,
    },
    {
        asin: 'B06XWZWYVP',
        createdOn: new Date(),
        data: {
            categories: [
                'Electronics',
                'Computers & Accessories',
                'Computer Accessories & Peripherals',
                'Memory Cards',
                'Micro SD Cards',
            ],
            dimensions: '0.6 x 0.4 x 0.6 inches',
            rank: [
                '#1 in Cell Phones & Accessories',
                '#1 in Electronics > Cell Phones & Accessories',
                '#1 in Cell Phones & Accessories > Cell Phone Accessories > Micro SD Cards',
            ],
            rating: '4.6 out of 5 stars',
            title: 'Samsung 128GB 100MB/s (U3) MicroSD EVO Select Memory Card with Adapter (MB-ME128GA/AM)',
        },
        status: ProductStatus.Success,
        updatedOn: new Date(),
    },
]

let store = createStore({
    products,
    viewingProduct: products[1].asin,
})

Object.assign(window, { S: store })

const AppRoot = () => <App store={store} />

const Root = hot(module)(AppRoot)

function renderApp() {
    ReactDOM.render(<Root />, document.getElementById('root'))
}

document.addEventListener('DOMContentLoaded', renderApp, false)

// Hot Module Replacement API
declare const module: NodeModule & { hot: any }
if (module.hot) {
    module.hot.accept('./', renderApp)
}
