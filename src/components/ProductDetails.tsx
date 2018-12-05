import React, { Component, Fragment } from 'react'
import { ListGroup, ListGroupItem, Button, Alert } from 'reactstrap'
import { observer } from 'mobx-react'

import { ProductStatus, ProductModel } from '../models/Product'
import autobind from '../utils/autobind'

const InfoItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <ListGroupItem>
        <strong className='mr-2'>{label}:</strong>
        {children}
    </ListGroupItem>
)

const EmptyValue = () => <>n/a</>

export interface ProductProps {
    product: ProductModel
    onRefresh?: (e: React.MouseEvent, product: ProductModel) => void
}

export class ProductDetails extends Component<ProductProps> {
    render() {
        const { onRefresh, product } = this.props
        const { isLoading, asin, data, updatedDateTime } = product

        return (
            <div className='well'>
                <h1>
                    {/* explicit spacing just makes text select easier */}
                    {'ASIN '}
                    <code>{asin}</code>
                    {isLoading && ' is refreshing…'}
                </h1>
                {this.renderTitle()}
                <ListGroup className={(isLoading && 'text-muted') || undefined}>
                    {data ? this.renderDetails() : this.renderExcuse()}

                    <InfoItem label='Updated On'>
                        <span className='mr-2'>{updatedDateTime || 'Unknown'}</span>
                        {onRefresh && (
                            <Button
                                className='details-refresh'
                                outline
                                color='primary'
                                size='sm'
                                onClick={this.handleRefresh}
                            >
                                {isLoading && 'Re-init '}
                                Refresh
                            </Button>
                        )}
                    </InfoItem>
                </ListGroup>
            </div>
        )
    }

    @autobind
    handleRefresh(e: React.MouseEvent) {
        const { onRefresh, product } = this.props
        onRefresh && onRefresh(e, product)
    }

    renderTitle() {
        const { data, isLoading } = this.props.product
        if (!data || !data.title) return

        return <h2 className={(isLoading && 'text-muted') || undefined}>{data.title}</h2>
    }

    renderExcuse() {
        const { status } = this.props.product
        switch (status) {
            case ProductStatus.Timeout:
                return (
                    <ListGroupItem>
                        <Alert color='warning'>Sync is canceled due to timeout. Please, try again</Alert>
                    </ListGroupItem>
                )
            case ProductStatus.Nomatch:
                return (
                    <ListGroupItem>
                        <Alert color='warning'>Cannot find Product with this ASIN. Sorry for that</Alert>
                    </ListGroupItem>
                )
            case ProductStatus.Fail:
                return (
                    <ListGroupItem>
                        <Alert color='danger'>
                            There was some fatal error during last sync. I wish I had more information
                        </Alert>
                    </ListGroupItem>
                )
        }
    }

    renderDetails() {
        const { data } = this.props.product
        if (!data) return null

        const rating = data.rating || <EmptyValue />
        const dimensions = data.dimensions || <EmptyValue />
        const categories = data.categories && data.categories.length ? data.categories.join(' › ') : <EmptyValue />
        const ranks =
            data.rank && data.rank.length ? (
                data.rank.map((rank, index) => (
                    <Fragment key={index}>
                        <br />
                        {rank}
                    </Fragment>
                ))
            ) : (
                <EmptyValue />
            )

        return (
            <>
                <InfoItem label='Category'>{categories}</InfoItem>
                <InfoItem label='Best Sellers Rank'>{ranks}</InfoItem>
                <InfoItem label='Product Dimensions'>{dimensions}</InfoItem>
                <InfoItem label='Rating'>{rating}</InfoItem>
            </>
        )
    }
}

export default observer(ProductDetails)
