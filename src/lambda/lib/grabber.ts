import cheerio from 'cheerio'
import fetch, { Response } from 'node-fetch'
import { ProductAsin, ProductSnapshot as Product, ProductDetailsSnapshot as ProductDetails } from '../../models/Product'

export type ParsedDetails = Partial<ProductDetails>

export const GRAB_BASE_URL = 'https://www.amazon.com/dp'
// It seems, googlebot gets a bit less data
// But, is it good to use it?
export const GRAB_USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

export async function fetchProduct(asin: ProductAsin): Promise<Response> {
    const url = `${GRAB_BASE_URL}/${asin}`
    return fetch(url, {
        headers: {
            Accept: 'text/html',
            'User-Agent': GRAB_USER_AGENT,
        },
    })
}

export async function parseProduct(html: string): Promise<ProductDetails> {
    const $ = cheerio.load(html)

    let data: ParsedDetails =
        // tslint:disable-next-line:prefer-object-spread
        $('.prodDetTable')
            .toArray()
            .reduce((all, one) => Object.assign(all, lookupDetailsTable(one)), {})

    if (!Object.keys(data).length) {
        // so, there is no details table in html…
        // assume, there is an older format
        data = lookupDetailsList($('#productDetailsTable, #detail-bullets'))
    }

    const $title = $('#title')

    return {
        ...data,
        // tslint:disable-next-line:variable-name
        categories: $('#wayfinding-breadcrumbs_feature_div')
            .find('a')
            .map((_i, el) => extractText(el))
            .get(),
        rating: String($('#acrPopover').attr('title') || '').trim(),
        title: String($title.find('span:first-child').text() || $title.text() || '').trim(),
    }
}

function extractText(el: Cheerio | CheerioElement): string {
    return cheerio(el)
        .text()
        .trim()
}

function lookupDetailsList(el: Cheerio | CheerioElement): ParsedDetails {
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

function lookupDetailsTable(el: Cheerio | CheerioElement): ParsedDetails {
    const $el = cheerio(el)

    const data: ParsedDetails = {}
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
    const match = value.match(re)
    return (match && match[0]) || undefined

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
