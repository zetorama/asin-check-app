export type ASIN = string

export enum GrabStatus {
	Queue = 'queue',
	Success = 'success',
	Nomatch = 'nomatch',
	Timeout = 'timeout',
	Fail = 'fail',
}

export interface ProductDetails {
	readonly title: string
	readonly categories: ReadonlyArray<string>
	readonly rating?: string
	readonly rank?: ReadonlyArray<string>
	readonly dimensions?: string
	// readonly dimensions?: {
	//     readonly l: number,
	//     readonly w: number,
	//     readonly h: number,
	// },
}

export type ParsedProdDetails = Partial<ProductDetails>

export interface GrabbedProduct {
	readonly asin: ASIN
	readonly status: GrabStatus
	readonly data?: ProductDetails
	readonly createdOn: Date
	readonly updatedOn?: Date
	readonly isViewed?: boolean
}
