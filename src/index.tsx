import React from 'react'
import ReactDOM from 'react-dom'
// TODO: figure out why HMR is so capricious
// import { hot } from 'react-hot-loader'
import { onSnapshot } from 'mobx-state-tree'
import 'bootstrap/dist/css/bootstrap.css'

import './index.css'
import App from './App'
import createStore from './models'
import Interval from './utils/Interval'

// Setup store + infinite updates
let appStore = createStore()
// TODO: switch to sockets or at least use an exponential backoff strategy
const timer = new Interval(1000, () => {
    const asins = appStore.loadingProducts.map((p) => p.asin)
    if (!asins.length) {
        timer.stop()
        return
    }

    appStore.fetchUpdates(asins)
})
onSnapshot(appStore, () => {
    appStore.saveProductsLog()
    timer.start()
})

console.info('DEBUG ME: Store is window.S')
Object.assign(window, { S: appStore })

// Setup views
const Root = () => <App store={appStore} />
const renderer = () => ReactDOM.render(<Root />, document.getElementById('root'))

document.addEventListener('DOMContentLoaded', renderer, false)
