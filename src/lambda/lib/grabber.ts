import cheerio from 'cheerio'
import fetch, { Response } from 'node-fetch'

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
    readonly rating: string
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
}

export const AMAZON_BASE_URL = 'https://www.amazon.com/dp'
// It seems, googlebot gets a bit less data
// But, is it good to use it?
export const USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

export async function grabProduct(asin: ASIN): Promise<GrabbedProduct> {
    const product: GrabbedProduct = {
        asin,
        createdOn: new Date(),
        status: GrabStatus.Queue,
    }

    const res = await fetchProduct(asin)
    if (!res.ok) {
        return updateProduct(product, {
            status: res.status === 404 ? GrabStatus.Nomatch : GrabStatus.Fail,
        })
    }

    const html = await res.text()
    const data = await parseProduct(html)
    return updateProduct(product, {
        data,
        status: GrabStatus.Success,
    })
}

export async function fetchProduct(asin: ASIN): Promise<Response> {
    const url = `${AMAZON_BASE_URL}/${asin}`
    return fetch(url, {
        headers: {
            Accept: 'text/html',
            'User-Agent': USER_AGENT,
        },
    })
}

export async function parseProduct(html: string): Promise<ProductDetails> {
    const $ = cheerio.load(html)

    let data: ParsedProdDetails =
        // tslint:disable-next-line:prefer-object-spread
        $('.prodDetTable')
            .toArray()
            .reduce((all, one) => Object.assign(all, lookupDetailsTable(one)), {})

    if (!Object.keys(data).length) {
        // so, there is no details table in html…
        // assume, there is an older format
        data = lookupDetailsList($('#productDetailsTable'))
    }

    return {
        ...data,
        // tslint:disable-next-line:variable-name
        categories: $('#wayfinding-breadcrumbs_feature_div a')
            .map((_i, el) => extractText(el))
            .get(),
        rating: $('#acrPopover')
            .attr('title')
            .trim(),
        title: $('#productTitle')
            .text()
            .trim(),
    }
}

function updateProduct(product: GrabbedProduct, changes: Partial<GrabbedProduct>): GrabbedProduct {
    return {
        ...product,
        updatedOn: new Date(),
        ...changes,
    }
}

function extractText(el: Cheerio | CheerioElement): string {
    return cheerio(el)
        .text()
        .trim()
}

function lookupDetailsList(el: Cheerio | CheerioElement): ParsedProdDetails {
    const $el = cheerio(el)

    const data: Partial<ProductDetails> = {}
    for (const row of $el.find('.content>ul>li').toArray()) {
        const $row = cheerio(row).clone()
        const $label = $row
            .find('b')
            .first()
            .remove()
        const labelText = $label.text().trim()

        if (/Product\ Dimensions\:/i.test(labelText)) {
            Object.assign(data, {
                dimensions: extractDimensions($row),
            })
        } else if (/Best\ Sellers\ Rank\:/i.test(labelText)) {
            Object.assign(data, {
                rank: extractRank($row),
            })
        }
    }

    return data
}

function lookupDetailsTable(el: Cheerio | CheerioElement): ParsedProdDetails {
    const $el = cheerio(el)

    const data: ParsedProdDetails = {}
    for (const row of $el.find('tr').toArray()) {
        const $label = cheerio(row).find('th')
        const labelText = $label.text().trim()

        if (/Product\ Dimensions/i.test(labelText)) {
            Object.assign(data, {
                dimensions: extractDimensions($label.nextAll()),
            })
        } else if (/Best\ Sellers\ Rank/i.test(labelText)) {
            Object.assign(data, {
                rank: extractRank($label.nextAll()),
            })
        }
    }

    return data
}

function extractDimensions(el: Cheerio | CheerioElement): ProductDetails['dimensions'] {
    // Expecting: "9.2 x 12 x 12.2 inches"
    const value = cheerio(el)
        .text()
        .trim()
    const re = /([0-9.]+)\s*x\s*([0-9.]+)\s*x\s*([0-9.]+)/m
    return re.test(value) ? value : undefined

    // const [, l, w, h] = (value.match(re) || []) as ReadonlyArray<string>

    // return l && w && h && {
    //     h: Number(h),
    //     l: Number(l),
    //     w: Number(w),
    // } || undefined
}

function extractRank(el: Cheerio | CheerioElement): ProductDetails['rank'] {
    // Expecting:
    // #35,531 in Cell Phones & Accessories (See Top 100 in Cell Phones & Accessories)
    // #1,133 in Cell Phones & Accessories > Cell Phone Accessories > Headphones > Over - Ear Headphones
    // #10,172 in Electronics > Portable Audio & Video > MP3 & MP4 Player Accessories
    // #10,449 in Electronics > Home Audio & Theater
    return (
        cheerio(el)
            .text()
            .trim()
            // remove `(See Top 100 in Cell Phones & Accessories)`
            .replace(/\(\w.*?\)/gm, '')
            // compact all whitespaces
            .replace(/\s+/gm, ' ')
            // split by "diez + number"
            .split(/\s*(?=#\d)/)
            // also try to be consistent with order
            .sort(compareRanks)
    )
}

function extractRankPosition(rank: string): number {
    // Expecting: "#10,449 in Electronics > Home Audio & Theater"
    return Number(
        rank
            .split(' in ', 2)
            .shift()!
            .replace(/\D/g, ''),
    )
}

function compareRanks(leftRank: string, rightRank: string): number {
    return compareRanksByStrlen(leftRank, rightRank) || compareRanksByPosition(leftRank, rightRank)
}

function compareRanksByStrlen(leftRank: string, rightRank: string): number {
    return leftRank.length - rightRank.length
}

function compareRanksByPosition(leftRank: string, rightRank: string): number {
    return extractRankPosition(leftRank) - extractRankPosition(rightRank)
}
