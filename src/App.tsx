import React, { Component } from 'react'
import { Container, Row, Col, Jumbotron } from 'reactstrap'
import { observer } from 'mobx-react'
import autobind from './utils/autobind'

import ProductLookup from './components/ProductLookup'
import ProductsLog from './components/ProductsLog'
import ProductDetails from './components/ProductDetails'

import { StoreModel } from './models/Store'

export interface AppProps {
    store: StoreModel
}

export class App extends Component<AppProps> {
    render() {
        return (
            <Container className='p-4'>
                <Row>
                    <Col lg='5'>{this.renderSidebar()}</Col>
                    <Col>{this.renderContent()}</Col>
                </Row>
            </Container>
        )
    }

    renderSidebar() {
        const { store } = this.props

        return (
            <>
                <h2 className='h1'>Product Lookup</h2>
                <ProductLookup defaultValue={store.lookingUpValue} onLookup={this.handleLookup} />
                <ProductsLog store={store} />
            </>
        )
    }

    @autobind
    handleLookup(e: React.MouseEvent | React.FormEvent, value: string) {
        const { store } = this.props
        store.lookup(value)
    }

    renderJumbothron() {
        return (
            <Jumbotron>
                <h1>Hey there!</h1>
                <p className='lead'>If you want to see some details, pick an Amazon product by its ASIN</p>
            </Jumbotron>
        )
    }

    renderContent() {
        const { viewingProduct } = this.props.store
        if (!viewingProduct) {
            return this.renderJumbothron()
        }

        return <ProductDetails product={viewingProduct} />
    }
}

export default observer(App)
