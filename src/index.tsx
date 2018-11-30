import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'
import { onSnapshot } from 'mobx-state-tree'
import 'bootstrap/dist/css/bootstrap.css'

import './index.css'
import App from './App'
import createStore, { ProductSnapshot, ProductStatus } from './models'
import Interval from './utils/Interval'

// Setup store + infinite updates
const store = createStore()
const timer = new Interval(1000, () => {
    const asins = store.loadingProducts.map((p) => p.asin)
    if (!asins.length) {
        timer.stop()
        return
    }

    store.fetchUpdates(asins)
})
onSnapshot(store, () => {
    store.saveProductsLog()
    timer.start()
})

console.info('DELETE ME: Store is window.S')
Object.assign(window, { S: store })

// Setup views
const AppRoot = () => <App store={store} />
const Root = hot(module)(AppRoot)
const renderer = () => ReactDOM.render(<Root />, document.getElementById('root'))

document.addEventListener('DOMContentLoaded', renderer, false)

// Hot Module Replacement API
declare const module: NodeModule & { hot: any }
if (module.hot) {
    module.hot.accept('./', renderer)
}
