export default function autobind(target: any, key: string, descriptor: any) {
    const fn = descriptor.value

    if (typeof fn !== 'function') {
        throw new Error(`@autobind decorator can only be applied to methods not: ${typeof fn}`)
    }

    return {
        configurable: true,
        get(this: any) {
            if (this === target.prototype) {
                return fn
            }

            const boundFn = fn.bind(this)
            Object.defineProperty(this, key, {
                value: boundFn,
                configurable: true,
                writable: true,
            })
            return boundFn
        },
    }
}
