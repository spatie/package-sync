import { ComparisonKind } from '../types/FileComparisonResult';
import { Comparison } from './Comparison';

const { compareTwoStrings } = require('string-similarity');

export class StringComparison extends Comparison {
    public compare(requiredScore: number | null): Comparison {
        this.score = compareTwoStrings(this.file?.contents ?? '', this.repoFile?.contents ?? '');
        this.comparisonPassed = this.meetsRequirement(requiredScore ?? 0);

        if (!this.passed()) {
            this.createIssue(null);
        }

        return this;
    }

    public getKind(): ComparisonKind {
        return ComparisonKind.FILE_NOT_SIMILAR_ENOUGH;
    }

    public meetsRequirement(percentage) {
        if (percentage === null || percentage === 0) {
            percentage = this.file?.requiredScores?.similar ?? 15;
        }

        return super.meetsRequirement(percentage);
    }
}
