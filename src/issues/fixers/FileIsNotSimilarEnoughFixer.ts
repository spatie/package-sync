/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class FileIsNotSimilarEnoughFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_NOT_SIMILAR_ENOUGH];

    public fix(): boolean {
        this.issue.resolved = false;

        console.log(`FILE NOT SIMILAR FIXER: manual review required for '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'user-review';
    }
}
