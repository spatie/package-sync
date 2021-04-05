/* eslint-disable no-unused-vars */

export class FileSizeComparison {
    static create(filesize1: number, filesize2: number) {
        return new FileSizeComparison(filesize1, filesize2);
    }

    constructor(public filesize1: number, public filesize2: number) {
        //
    }

    get difference(): number {
        return this.filesize1 - this.filesize2;
    }

    get percentDifference(): number {
        const diff = this.difference;

        return diff === 0 ? 0 : (diff / this.filesize1) * 100;
    }

    public differByPercentage(percentage = 15): boolean {
        const pctDecimal = percentage * 0.01;

        return this.difference > Math.round(this.filesize1 * pctDecimal);
    }

    public percentDifferenceForDisplay(padStart = 0, padEnd = 0): string {
        return (this.percentDifference.toFixed(2) + '%').padStart(padStart)
            .padEnd(padEnd);
    }
}

export function compareFileSizes(filesize1: number, filesize2: number): FileSizeComparison {
    return FileSizeComparison.create(filesize1, filesize2);
}
