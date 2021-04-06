/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { FileMerger } from '../../lib/FileMerger';
import { Fixer } from './Fixer';
import { RepositoryIssue } from '../RepositoryIssue';

export class GitFileFixer extends Fixer {
    public static handles = [ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED];

    public static canFix(issue: RepositoryIssue): boolean {
        if (issue.resolved) {
            return false;
        }

        return ['.gitattributes', '.gitignore'].includes(issue.name);
    }

    public fix(): boolean {
        FileMerger.create()
            .add(this.issue.sourcefile.filename, this.issue.targetfile.filename)
            .mergeAndSave(this.issue.targetfile.filename);

        this.issue.resolved = true;

        console.log(`GIT FILE FIXER: merged '${this.issue.sourcefile.relativeName}'`);

        return true;
    }

    public static prettyName(): string {
        return 'merge-files';
    }
}
