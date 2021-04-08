/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';
import { RepositoryIssue } from '../../repositories/RepositoryIssue';
import { classOf } from '../../lib/helpers';

export class OptionalPackagesFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_NOT_USED, ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND];

    public description() {
        return 'skips the installation of a dependency.';
    }

    public static canFix(issue: RepositoryIssue): boolean {
        if (!super.canFix(issue)) {
            return false;
        }

        return false;
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        console.log(`OPTIONAL PACKAGES FIXER: skipping '${this.issue.name}'`);

        this.issue.resolve(classOf(this)
            .prettyName())
            .addResolvedNote(`skipped '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'skip-dep';
    }
}
