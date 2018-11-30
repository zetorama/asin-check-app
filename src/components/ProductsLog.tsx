import React, { Component } from 'react'
import { ListGroup } from 'reactstrap'
import { observer } from 'mobx-react'

import ProductLogItem from './ProductLogItem'
import { StoreModel } from '../models/Store'
import { ProductAsin } from '../models/Product'
import autobind from '../utils/autobind'

export interface ProductsLogProps {
    store: StoreModel
}

export class ProductsLog extends Component<ProductsLogProps> {
    render() {
        const { products, viewingProduct } = this.props.store
        if (!products || !Array.isArray(products) || !products.length) return null

        return (
            <ListGroup className='mb-3' flush>
                {products.map((product) => (
                    <ProductLogItem key={product.asin} product={product} onClick={this.handleItemClick} />
                ))}
            </ListGroup>
        )
    }

    @autobind
    handleItemClick(e: React.MouseEvent, product: ProductAsin) {
        const { store } = this.props
        store.viewProduct(product)
    }
}

export default observer(ProductsLog)
