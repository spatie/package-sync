/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { RepositoryFile } from '../repositories/RepositoryFile';
import { ComparisonKind } from '../types/FileComparisonResult';
import { Comparison } from './Comparison';

export class FileExistsComparison extends Comparison {
    protected kind: ComparisonKind = ComparisonKind.FILE_NOT_FOUND;

    public compare(requiredScore: number | null): Comparison {
        this.score = 0;
        this.comparisonPassed = this.meetsRequirement(requiredScore ?? 0);

        if (!this.comparisonPassed) {
            this.kind = this.file?.isFile() ?? false ? ComparisonKind.FILE_NOT_FOUND : ComparisonKind.DIRECTORY_NOT_FOUND;

            this.createIssue(null);
        }

        return this;
    }

    public getKind(): ComparisonKind {
        return this.kind;
    }

    public meetsRequirement(percentage): boolean {
        if (this.file === null) {
            return false;
        }

        return (this.file?.shouldIgnore ?? false) || this.repo.hasFile(<RepositoryFile>(<unknown>this.file));
    }
}
