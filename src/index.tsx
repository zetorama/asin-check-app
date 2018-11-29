import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.css'

import './index.css'
import App from './App'
import { GrabStatus, GrabbedProduct } from './product'

const product: GrabbedProduct = {
	asin: 'B06XWZWYVP',
	createdOn: new Date(),
	data: {
		categories: [
			'Electronics',
			'Computers & Accessories',
			'Computer Accessories & Peripherals',
			'Memory Cards',
			'Micro SD Cards',
		],
		dimensions: '0.6 x 0.4 x 0.6 inches',
		rank: [
			'#1 in Cell Phones & Accessories',
			'#1 in Electronics > Cell Phones & Accessories',
			'#1 in Cell Phones & Accessories > Cell Phone Accessories > Micro SD Cards',
		],
		rating: '4.6 out of 5 stars',
		title: 'Samsung 128GB 100MB/s (U3) MicroSD EVO Select Memory Card with Adapter (MB-ME128GA/AM)',
	},
	status: GrabStatus.Success,
	updatedOn: new Date(),
}

const log: GrabbedProduct[] = [
	{
		asin: 'YVPB06XWZW',
		createdOn: new Date(),
		status: GrabStatus.Queue,
	},
	{
		asin: 'ZWYVPB06XW',
		createdOn: new Date(),
		status: GrabStatus.Fail,
	},
	{
		asin: 'PB06XWZWYV',
		createdOn: new Date(),
		status: GrabStatus.Success,
		data: {
			title: 'Foo Bar',
			categories: [],
		},
		isViewed: true,
	},
	{
		asin: '6XWZWYVPB0',
		createdOn: new Date(),
		status: GrabStatus.Fail,
		isViewed: true,
	},
	product,
]

ReactDOM.render(<App activeProduct={product} productsLog={log} />, document.getElementById('root'))
