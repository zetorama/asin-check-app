import React, { Component } from 'react'
import { Container, Row, Col, Jumbotron } from 'reactstrap'

import { GrabbedProduct } from './product'
import Lookup from './components/Lookup'
import Product from './components/Product'
import ProductsLog from './components/ProductsLog'

export interface AppProps {
	activeProduct?: GrabbedProduct
	productsLog?: GrabbedProduct[]
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
		const { activeProduct, productsLog } = this.props

		return (
			<>
				<Lookup />
				<hr />
				<ProductsLog products={productsLog} activeAsin={activeProduct && activeProduct.asin} />
			</>
		)
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
		const { activeProduct } = this.props
		if (!activeProduct) {
			return this.renderJumbothron()
		}

		return <Product product={activeProduct} />
	}
}

export default App
