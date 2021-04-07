/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { FileMerger } from '../../lib/FileMerger';
import { Fixer } from './Fixer';
import { RepositoryIssue } from '../RepositoryIssue';
import { classOf } from '../../lib/helpers';

export class GitFileFixer extends Fixer {
    public static handles = [ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED, ComparisonKind.FILE_NOT_SIMILAR_ENOUGH];

    public static canFix(issue: RepositoryIssue): boolean {
        if (!super.canFix(issue)) {
            return false;
        }

        return ['.gitattributes', '.gitignore'].includes(issue.name);
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        FileMerger.create()
            .add(this.issue.sourcefile.filename, this.issue.targetfile.filename)
            .mergeAndSave(this.issue.targetfile.filename);

        console.log(`GIT FILE FIXER: merged '${this.issue.sourcefile.relativeName}'`);

        this.issue
            .resolve(classOf(this)
                .prettyName())
            .addResolvedNote(`merged '${this.issue.sourcefile.relativeName}' from skeleton and package`);

        return true;
    }

    public static prettyName(): string {
        return 'merge-files';
    }
}
