import { ComparisonKind } from '../types/FileComparisonResult';
import { Comparison } from './Comparison';

export class FileSizeComparison extends Comparison {
    protected filesize1 = 0;
    protected filesize2 = 0;

    public compare(requiredScore: number | null): Comparison {
        this.filesize1 = this.file?.sizeOnDisk ?? 0;
        this.filesize2 = this.repoFile?.sizeOnDisk ?? 0;

        this.score = this.percentage();
        this.comparisonPassed = !this.meetsRequirement(requiredScore);

        if (!this.passed()) {
            this.createIssue(null);
        }

        return this;
    }

    public getKind(): ComparisonKind {
        return ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED;
    }

    public meetsRequirement(percentage): boolean {
        if (percentage === null) {
            percentage = this.file?.requiredScores?.size ?? 15;
        }

        const pctDecimal = percentage * 0.01;

        return this.difference() > Math.round(this.filesize1 * pctDecimal);
    }

    public prettyScore(): string {
        if (this.score === null) {
            return '';
        }

        return (this.score?.toFixed(2) ?? '0.0') + '%';
    }

    public difference() {
        return this.filesize1 - this.filesize2;
    }

    public percentage(): number {
        if (this.difference() === 0) {
            return 0;
        }

        return (this.difference() / this.filesize1) * 100;
    }
}
