/* eslint-disable no-unused-vars */

import { FileMerger } from '../../lib/FileMerger';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { PackageIssue } from '../PackageIssue';
import { Fixer } from './Fixer';

export class GitFileFixer extends Fixer {
    public static handles = [ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED];

    public static canFix(issue: PackageIssue): boolean {
        if (issue.resolved) {
            return false;
        }

        return ['.gitattributes', '.gitignore'].includes(issue.result.name);
    }

    public fix(): boolean {
        const relativeFn: string = this.issue.result.name;
        const sourceFn = `${this.issue.skeletonPath}/${relativeFn}`;
        const targetFn = `${this.issue.repositoryPath}/${relativeFn}`;

        FileMerger.create()
            .add(sourceFn, targetFn)
            .mergeAndSave(targetFn);

        this.issue.resolved = true;

        console.log(`GIT FILE FIXER: merged '${relativeFn}'`);

        return true;
    }
}
