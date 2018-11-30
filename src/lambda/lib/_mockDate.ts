const OrigDate: any = Date

export function mockDate(isoDate: any = 0): void {
    // tslint:disable-next-line:no-class
    const Date = class extends OrigDate {
        constructor(...args: any[]) {
            super(args)
            // tslint:disable-next-line:no-this
            return args.length ? this : new OrigDate(isoDate)
        }
    }

    Object.assign(global, { Date })
}

export function unmockDate(): void {
    Object.assign(global, { Date: OrigDate })
}
