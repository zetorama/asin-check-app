import React, { Component } from 'react'
import { ListGroup, Button } from 'reactstrap'
import { observer } from 'mobx-react'

import ProductLogItem from './ProductLogItem'
import { StoreModel, PRODUCTS_LIMIT } from '../models/Store'
import { ProductAsin } from '../models/Product'
import autobind from '../utils/autobind'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'

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
                <ListGroupItem className='small text-muted'>
                    <Button
                        outline
                        color='danger'
                        size='sm'
                        className='clicky'
                        onClick={this.handleTrashClick}
                        title='Clear Products List'
                    >
                        🗑
                    </Button>
                    <em className='ml-3'>Showing up to {PRODUCTS_LIMIT} last products</em>
                </ListGroupItem>
            </ListGroup>
        )
    }

    @autobind
    handleItemClick(e: React.MouseEvent, product: ProductAsin) {
        const { store } = this.props
        store.viewProduct(product)
    }

    @autobind
    handleTrashClick(e: React.MouseEvent) {
        const { store } = this.props
        store.clearProducts()
    }
}

export default observer(ProductsLog)
