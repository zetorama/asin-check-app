import { readFile } from 'fs'
export const FIXTURE_PATH = `${process.cwd()}/test/fixtures`

interface ReadFileOpts {
    readonly encoding?: null
    readonly flag?: string
}

export async function getFixture(filename: string, opts?: ReadFileOpts | undefined | null): Promise<string> {
    const fixturePath = `${FIXTURE_PATH}/${filename}`
    return new Promise<string>((resolve, reject) => {
        readFile(fixturePath, opts, (err, data) => (err ? reject(err) : resolve(data.toString('utf8'))))
    })
}
