import React, { Component, Fragment } from 'react'
import { ListGroup, ListGroupItem, Button, Alert } from 'reactstrap'
import { observer } from 'mobx-react'

import { ProductStatus, ProductModel } from '../models/Product'

const InfoItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <ListGroupItem>
        <strong className='mr-2'>{label}:</strong>
        {children}
    </ListGroupItem>
)

const EmptyValue = () => <>—</>

export interface ProductProps {
    product: ProductModel
}

export class ProductDetails extends Component<ProductProps> {
    render() {
        const { isLoading, asin, data, updatedOn } = this.props.product

        const updated = updatedOn ? `${updatedOn.toLocaleDateString()} at ${updatedOn.toLocaleTimeString()}` : 'Unknown'

        return (
            <div className='well'>
                <h1>
                    ASIN
                    <code className='mx-2'>{asin}</code>
                    {isLoading && 'is refreshing…'}
                </h1>
                {this.renderTitle()}
                <ListGroup className={(isLoading && 'text-muted') || undefined}>
                    {data ? this.renderDetails() : this.renderExcuse()}
                    <InfoItem label='Updated On'>
                        <span className='mr-2'>{updated}</span>
                        <Button color='primary' size='sm' disabled={isLoading} outline>
                            Refresh
                        </Button>
                    </InfoItem>
                </ListGroup>
            </div>
        )
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
            </>
        )
    }
}

export default observer(ProductDetails)
