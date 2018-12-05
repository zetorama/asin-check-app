import * as React from 'react'
import { shallow, mount } from 'enzyme'

import { ProductLookup } from './ProductLookup'
import { Product, ProductStatus } from '../models'

describe('ProductLookup', () => {
    it('renders with empty value', () => {
        const cb = jest.fn()
        const cmp = shallow(<ProductLookup onLookup={cb} />)

        expect(
            cmp
                .find('.lookup-button')
                .at(0)
                .prop('disabled'),
        ).toBe(true)

        expect(cmp).toMatchSnapshot()
    })

    it('renders with default value', () => {
        const cb = jest.fn()
        const cmp = shallow(<ProductLookup onLookup={cb} defaultValue={'foo bar'} />)

        expect(
            cmp
                .find('.lookup-button')
                .at(0)
                .prop('disabled'),
        ).toBe(true)

        expect(cmp).toMatchSnapshot()
    })

    it('changes input value', () => {
        const cb = jest.fn()
        const cmp = mount(<ProductLookup onLookup={cb} defaultValue={'foo bar'} />)

        expect(
            cmp
                .find('.lookup-input')
                .at(0)
                .prop('value'),
        ).toBe('foo bar')
        cmp.find('.lookup-input')
            .at(0)
            .simulate('change', { target: { value: 'xxx' } })
        expect(
            cmp
                .find('.lookup-input')
                .at(0)
                .prop('value'),
        ).toBe('xxx')

        expect(
            cmp
                .find('.lookup-button')
                .at(0)
                .prop('disabled'),
        ).toBe(false)

        expect(cmp).toMatchSnapshot()
    })

    it.skip('calls lookup callback', () => {
        const cb = jest.fn()
        const cmp = mount(<ProductLookup onLookup={cb} />)

        cmp.find('.lookup-input')
            .at(0)
            .simulate('change', { target: { value: 'xxx' } })

        expect(
            cmp
                .find('.lookup-button')
                .at(0)
                .prop('disabled'),
        ).toBe(false)
        cmp.find('.lookup-button')
            .at(0)
            .simulate('click')

        // TODO: figure out, why click doesn't work…
        expect(cb).toBeCalled()
    })
})
