/* eslint-disable no-unused-vars */

import { existsSync, writeFileSync } from 'fs';
import { basename, sep } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';
import { RepositoryIssue } from '../RepositoryIssue';
import { DirectoryNotFoundFixer } from './DirectoryNotFoundFixer';
import { FileNotFoundFixer } from './FileNotFoundFixer';

export class GithubFixer extends Fixer {
    public static handles = [ComparisonKind.DIRECTORY_NOT_FOUND, ComparisonKind.FILE_NOT_FOUND];

    public fixesIssue(issue: RepositoryIssue): boolean {
        return GithubFixer.canFix(issue);
    }

    public static canFix(issue: RepositoryIssue): boolean {
        if (issue.resolved) {
            return false;
        }

        if (issue.availableFixers.includes('user-review')) {
            return false;
        }

        if (!issue.name.startsWith('.github' + sep)) {
            return false;
        }

        return GithubFixer.handles.includes(issue.kind);
    }

    public fix(): boolean {
        if (this.issue.resolved) {
            return false;
        }

        if (this.issue.kind === ComparisonKind.DIRECTORY_NOT_FOUND) {
            new DirectoryNotFoundFixer(this.issue)
                .fix();
        }

        if (this.issue.kind === ComparisonKind.FILE_NOT_FOUND) {
            new FileNotFoundFixer(this.issue)
                .fix();
        }

        this.issue.resolve(GithubFixer.prettyName());
        //this.issue.resolvedNotes.push(`fixed '${this.issue.kind}' for '${this.issue.name}`);

        console.log(`GITHUB FIXER: fixed '${this.issue.kind}' issue for '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'github';
    }
}
