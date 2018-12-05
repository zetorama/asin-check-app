import React, { Component } from 'react'
import { ListGroupItem } from 'reactstrap'
import { observer } from 'mobx-react'

import { ProductStatus, ProductModel, ProductAsin } from '../models/Product'
import autobind from '../utils/autobind'

const LoadingIcon = () => <b className='z-blink'>•</b>
const WarningIcon = () => <>⚠️</>

export interface ProductLogItemProps {
    product: ProductModel
    onClick?: (e: React.MouseEvent, product: ProductAsin) => void
}

export class ProductLogItem extends Component<ProductLogItemProps> {
    render() {
        const { product, onClick } = this.props
        const color =
            product.status === ProductStatus.InQueue || product.status === ProductStatus.New
                ? 'info'
                : product.isViewed
                ? undefined
                : product.status === ProductStatus.Success
                ? 'success'
                : 'warning'

        const icon =
            product.status === ProductStatus.InQueue || product.status === ProductStatus.New ? (
                <LoadingIcon />
            ) : product.status !== ProductStatus.Success ? (
                <WarningIcon />
            ) : null

        const isActive = product.isCurrentlyViewing

        return (
            <ListGroupItem
                action
                color={color}
                active={isActive}
                onClick={onClick && this.handleClick}
                className={onClick && 'clicky'}
            >
                <code className='mr-2'>{product.asin}</code>
                {' ' /* explicit spacing makes text read/select easier */}
                {this.renderTitle()}
                {icon}
            </ListGroupItem>
        )
    }

    renderTitle() {
        const { data } = this.props.product
        if (!data || !data.title) return ''

        // TODO: change layout/CSS to use `text-overflow` for title/category trimming
        const label = data.title.length > 21 ? data.title.substr(0, 20) + '…' : data.title
        const category =
            data.categories && data.categories.length ? (
                <em className='ml-1 text-nowrap'>‹ {data.categories[0]}</em>
            ) : (
                undefined
            )

        return (
            <small className='mr-2'>
                {label}
                {category}
            </small>
        )
    }

    @autobind
    handleClick(e: React.MouseEvent) {
        const { product, onClick } = this.props
        onClick && onClick(e, product.asin)
    }
}

export default observer(ProductLogItem)
