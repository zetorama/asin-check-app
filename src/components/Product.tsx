import React, { Component } from 'react'
import { ListGroup, ListGroupItem, Button, Alert } from 'reactstrap'

import { GrabbedProduct, GrabStatus } from '../product'

const InfoItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<ListGroupItem>
		<strong className='mr-2'>{label}:</strong>
		{children}
	</ListGroupItem>
)

export interface ProductProps {
	product: GrabbedProduct
}

export class Product extends Component<ProductProps> {
	render() {
		const { product } = this.props
		if (!product) return null

		return (
			<div className='well'>
				<h1>
					ASIN:
					<code>{product.asin}</code>
				</h1>
				{product.data && product.data.title && <h2>{product.data.title}</h2>}
				<ListGroup>
					{product.data ? this.renderDetails() : this.renderExcuse()}
					<InfoItem label='Updated On'>
						{String(product.updatedOn)}{' '}
						<Button color='primary' size='sm' outline>
							Refresh
						</Button>
					</InfoItem>
				</ListGroup>
			</div>
		)
	}

	renderExcuse() {
		const { status } = this.props.product
		switch (status) {
			case GrabStatus.Timeout:
				return (
					<ListGroupItem>
						<Alert color='warning'>Sync was canceled due to timeout. Please, try again</Alert>
					</ListGroupItem>
				)
			case GrabStatus.Nomatch:
				return (
					<ListGroupItem>
						<Alert color='warning'>Product with such ASIN wasn't found on Amazon. Sorry for that</Alert>
					</ListGroupItem>
				)
			case GrabStatus.Fail:
				return (
					<ListGroupItem>
						<Alert color='danger'>There was some fatal error during last sync. I wish I had logs</Alert>
					</ListGroupItem>
				)
		}
	}

	renderDetails() {
		const { data } = this.props.product
		if (!data) return null

		return (
			<>
				<InfoItem label='Category'>{data.categories.join(' › ')}</InfoItem>
				<InfoItem label='Best Sellers Rank'>{this.renderRank()}</InfoItem>
				<InfoItem label='Product Dimensions'>{this.renderDimensions()}</InfoItem>
			</>
		)
	}

	renderDimensions() {
		const { data } = this.props.product
		if (!data) return null

		return data.dimensions || '—'
	}

	renderRank() {
		const { data } = this.props.product
		if (!data) return null

		if (!data.rank) {
			return '—'
		}

		return data.rank.map((rank) => (
			<>
				<br />
				{rank}
			</>
		))
	}
}

export default Product
