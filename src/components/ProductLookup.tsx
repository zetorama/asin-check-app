import React, { Component } from 'react'
import { InputGroup, InputGroupAddon, InputGroupText, Input, Button, Form } from 'reactstrap'
import autobind from '../utils/autobind'

import { ProductAsin } from '../models/Product'

export interface ProductLookupProps {
    defaultValue?: string
    onLookup: (e: React.MouseEvent | React.FormEvent, value: string) => void
}

export interface ProductLookupState {
    defaultValue?: string
    value: string
}

export class ProductLookup extends Component<ProductLookupProps, ProductLookupState> {
    static getDerivedStateFromProps(props: ProductLookupProps, state: ProductLookupState): ProductLookupState | null {
        if (props.defaultValue !== state.defaultValue) {
            return {
                value: props.defaultValue || '',
                defaultValue: props.defaultValue,
            }
        }

        return null
    }

    state: ProductLookupState = {
        value: '',
    }

    render() {
        const { value, defaultValue } = this.state
        const isBtnDisabled = !value || value === defaultValue

        return (
            <Form onSubmit={this.handleLookup}>
                <InputGroup className='mb-3'>
                    <InputGroupAddon addonType='prepend'>
                        <InputGroupText>ASIN</InputGroupText>
                    </InputGroupAddon>
                    <Input
                        placeholder='ABCDEFG012'
                        className='text-monospace'
                        value={value}
                        onChange={this.handleInputChange}
                    />
                    <InputGroupAddon addonType='append'>
                        <Button color='primary' disabled={isBtnDisabled}>
                            Find
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Form>
        )
    }

    @autobind
    handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            value: e.target.value,
        })
    }

    @autobind
    handleLookup(e: React.MouseEvent | React.FormEvent) {
        e.preventDefault()
        const { onLookup } = this.props
        onLookup && onLookup(e, this.state.value)
    }
}

export default ProductLookup
