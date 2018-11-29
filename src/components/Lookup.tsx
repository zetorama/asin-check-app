import React, { Component } from 'react'
import { InputGroup, InputGroupAddon, InputGroupText, Input, Button } from 'reactstrap'

export class Lookup extends Component {
	render() {
		return (
			<InputGroup>
				<InputGroupAddon addonType='prepend'>
					<InputGroupText>ASIN</InputGroupText>
				</InputGroupAddon>
				<Input placeholder='ABCDEFG012' />
				<InputGroupAddon addonType='append'>
					<Button color='primary'>Go!</Button>
				</InputGroupAddon>
			</InputGroup>
		)
	}
}

export default Lookup
