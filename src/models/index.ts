import { Store, StoreModel, StoreSnapshot } from './Store'

export * from './Store'
export * from './Product'

export function createStore(initial?: StoreSnapshot): StoreModel {
    return Store.create(initial)
}

export default createStore
