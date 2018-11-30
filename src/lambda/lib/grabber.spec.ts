// tslint:disable:no-expression-statement
import test, { after, before } from 'ava'
import { getFixture } from './_getFixture'
import { mockDate, unmockDate } from './_mockDate'
import { fetchProduct, grabProduct, GrabStatus, parseProduct } from './grabber'

const ASIN_BOOK = '0141439513'
const ASIN_CARD = 'B06XWZWYVP'

const FIXT_BOOK = 'product_book.html'
const FIXT_CARD = 'product_card.html'

before(() => mockDate())
after(() => unmockDate())

test('parse a book product', async (t) => {
    const html = await getFixture(FIXT_BOOK)
    t.snapshot(await parseProduct(html))
})

test('parse a memory card product', async (t) => {
    const html = await getFixture(FIXT_CARD)
    t.snapshot(await parseProduct(html))
})

test('fetch a book product', async (t) => {
    const res = await fetchProduct(ASIN_BOOK)
    t.true(res.ok, `Cannot fetch product ${ASIN_BOOK} (${res.status})`)

    const html = await res.text()
    t.true(html.indexOf(ASIN_BOOK) >= 0)
})

test('grab a memory card product', async (t) => {
    const result = await grabProduct(ASIN_CARD)
    // console.log(JSON.stringify(result, null, 2))

    // We cannot take snapshot of something remoted
    t.true(result.asin === ASIN_CARD)
    t.true(result.status === GrabStatus.Success)
    t.truthy(result.data)

    const { title, categories, rank, dimensions } = result.data!
    t.truthy(title && categories && rank && dimensions)
})
