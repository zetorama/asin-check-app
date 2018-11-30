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
            product.status === ProductStatus.Queue || product.status === ProductStatus.Init
                ? 'info'
                : product.isViewed
                ? undefined
                : product.status === ProductStatus.Success
                ? 'success'
                : 'warning'

        const icon =
            product.status === ProductStatus.Queue || product.status === ProductStatus.Init ? (
                <LoadingIcon />
            ) : product.status !== ProductStatus.Success ? (
                <WarningIcon />
            ) : null

        const isActive = product.isCurrentlyViewing
        const title = String((product.data && product.data.title) || '')
        const label = title && <small className='mr-2'>{title.length > 21 ? title.substr(0, 20) + '…' : title}</small>

        return (
            <ListGroupItem
                action
                color={color}
                active={isActive}
                onClick={onClick && this.handleClick}
                className={onClick && 'clicky'}
            >
                <code className='mr-2'>{product.asin}</code>
                {label}
                {icon}
            </ListGroupItem>
        )
    }

    @autobind
    handleClick(e: React.MouseEvent) {
        const { product, onClick } = this.props
        onClick && onClick(e, product.asin)
    }
}

export default observer(ProductLogItem)
