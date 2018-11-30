export class Interval {
    protected _tid?: NodeJS.Timeout

    constructor(public interval: number, public callback: () => void, public isRunning: boolean = false) {
        this.schedule()
    }

    schedule() {
        if (this.isRunning) {
            this.start()
        }
    }

    start() {
        this.isRunning = true
        if (this._tid) return

        this._tid = setTimeout(() => {
            delete this._tid
            this.callback()
            this.schedule()
        }, this.interval)
    }

    stop() {
        this._tid && clearTimeout(this._tid)
        delete this._tid
        this.isRunning = false
    }
}

export default Interval
