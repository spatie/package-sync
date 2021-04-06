/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';
import { RepositoryIssue } from '../RepositoryIssue';

export class OptionalPackagesFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_NOT_USED, ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND];

    public static canFix(issue: RepositoryIssue): boolean {
        if (issue.resolved) {
            return false;
        }

        return this.config()
            ?.includes(issue.name) ?? false;
    }

    public fix(): boolean {
        if (this.issue.resolved) {
            return false;
        }

        console.log(`OPTIONAL PACKAGES FIXER: skipping '${this.issue.name}'`);

        this.issue.resolve(OptionalPackagesFixer.prettyName());
        this.issue.resolvedNotes.push(`skipped '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'skip-dep';
    }
}
