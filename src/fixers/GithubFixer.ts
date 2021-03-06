/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../types/FileComparisonResult';
import { Fixer } from './Fixer';
import { RepositoryIssue } from '../repositories/RepositoryIssue';
import { DirectoryNotFoundFixer } from './DirectoryNotFoundFixer';
import { FileNotFoundFixer } from './FileNotFoundFixer';

export class GithubFixer extends Fixer {
    public static handles = [ComparisonKind.DIRECTORY_NOT_FOUND, ComparisonKind.FILE_NOT_FOUND];

    public description() {
        return `recreates all missing directories and files under the '.github' directory.`;
    }

    public runsFixers(): boolean {
        return true;
    }

    public fixesIssue(issue: RepositoryIssue): boolean {
        return GithubFixer.canFix(issue);
    }

    public static canFix(issue: RepositoryIssue): boolean {
        if (!super.canFix(issue)) {
            return false;
        }

        if (!issue.name.startsWith('.github')) {
            return false;
        }

        return GithubFixer.handles.includes(issue.kind);
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        if (this.issue.is(ComparisonKind.DIRECTORY_NOT_FOUND)) {
            new DirectoryNotFoundFixer(this.issue)
                .fix();
        }

        if (this.issue.is(ComparisonKind.FILE_NOT_FOUND)) {
            new FileNotFoundFixer(this.issue)
                .fix();
        }

        this.issue.resolve(this);

        return true;
    }

    public static prettyName(): string {
        return 'github';
    }
}
