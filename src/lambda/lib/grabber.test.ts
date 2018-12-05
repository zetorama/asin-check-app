import { readFileSync } from 'fs'
import { parseProduct, fetchProduct } from './grabber'

const book = readFileSync(`${__dirname}/__fixtures__/product_book.html`).toString('utf8')
const card = readFileSync(`${__dirname}/__fixtures__/product_card.html`).toString('utf8')

describe('grabber', () => {
    it('parses a book product page', async () => {
        const data = await parseProduct(book)
        expect(data).toMatchSnapshot()
    })

    it('parses a card product page', async () => {
        const data = await parseProduct(card)
        expect(data).toMatchSnapshot()
    })

    it('fetches a product by asin', async () => {
        const response = await fetchProduct('ZZZZZZZZZZ')
        expect(response.ok).toBe(true)

        const html = await response.text()
        expect(html).toMatch(/ZZZZZZZZZZ/i)
    })
})
