import React, { Component } from 'react'
import { ListGroup, ListGroupItem, Button, Alert } from 'reactstrap'

import { GrabbedProduct, GrabStatus } from '../product'

export interface ProductsLogProps {
	products?: GrabbedProduct[]
	activeAsin?: string
}

const LoadingIcon = () => <b className='z-blink'>•</b>
const WarningIcon = () => <>⚠️</>

const LogItem = ({ product, isActive }: { product: GrabbedProduct; isActive?: boolean }) => {
	const color =
		product.status === GrabStatus.Queue
			? 'info'
			: product.isViewed
			? undefined
			: product.status === GrabStatus.Success
			? 'success'
			: 'warning'

	const icon =
		product.status === GrabStatus.Queue ? (
			<LoadingIcon />
		) : product.status !== GrabStatus.Success ? (
			<WarningIcon />
		) : null

	const title = String((product.data && product.data.title) || '')
	const label = title && <small className='mr-2'>{title.length > 21 ? title.substr(0, 20) + '…' : title}</small>

	return (
		<ListGroupItem color={color} active={isActive} action>
			<code className='mr-2'>{product.asin}</code>
			{label}
			{icon}
		</ListGroupItem>
	)
}

export class ProductsLog extends Component<ProductsLogProps> {
	render() {
		const { products, activeAsin } = this.props
		if (!products || !Array.isArray(products) || !products.length) return null

		return (
			<ListGroup flush>
				{products.map((product) => (
					<LogItem product={product} isActive={product.asin === activeAsin} />
				))}
			</ListGroup>
		)
	}
}

export default ProductsLog
