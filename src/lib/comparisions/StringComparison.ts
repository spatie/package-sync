/* eslint-disable no-unused-vars */

const { compareTwoStrings } = require('string-similarity');

export class StringComparison {
    protected _similarityScore: number;

    constructor(protected _string1: string, protected _string2: string) {
        this._similarityScore = compareTwoStrings(this.string1, this.string2);
    }

    static create(string1: string, string2: string) {
        return new StringComparison(string1, string2);
    }

    get similarityScore() {
        return this._similarityScore;
    }

    get string1() {
        return this._string1;
    }

    get string2() {
        return this._string2;
    }

    public meetsRequirement(minimum: number) {
        return this.similarityScore >= minimum;
    }
}
