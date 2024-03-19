export class SectionNumber {
    /**
     * @type {number[]}
     */
    values;

    /**
     * @type {number[]}
     */
    constructor(values) {
        this.values = values;
    }

    clone() {
        return new SectionNumber(this.values.slice(0));
    }

    increment() {
        this.values[this.values.length - 1]++;
    }

    withIncrement() {
        const n = this.clone();
        n.increment();
        return n;
    }

    toString() {
        return this.values.join(".");
    }
}