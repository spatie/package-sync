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

    get percentage(): number {
        if (this.difference === 0) {
            return 0;
        }

        return (this.difference / this.filesize1) * 100;
    }

    public meetsRequirement(percentage = 15): boolean {
        if (this.difference === 0) {
            return false;
        }

        const pctDecimal = percentage * 0.01;

        return this.difference >= Math.round(this.filesize1 * pctDecimal);
    }

    public format(decimals = 2, suffix = '%'): string {
        return this.percentage.toFixed(decimals) + suffix;
    }
}

export function compareFileSizes(filesize1: number, filesize2: number): FileSizeComparison {
    return FileSizeComparison.create(filesize1, filesize2);
}
