/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';
import { RepositoryIssue } from '../RepositoryIssue';
import { FileNotFoundFixer } from './FileNotFoundFixer';
import { PackageScriptNotFoundFixer } from './PackageScriptNotFoundFixer';
import { PackageNotUsedFixer } from './PackageNotUsedFixer';

export class PsalmFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_NOT_USED, ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND, ComparisonKind.FILE_NOT_FOUND];

    public description() {
        return 'creates all missing psalm-related files and installs all psalm composer scripts and dependencies.';
    }

    public runsFixers(): boolean {
        return true;
    }

    public fixesIssue(issue: RepositoryIssue): boolean {
        return PsalmFixer.canFix(issue);
    }

    public static canFix(issue: RepositoryIssue): boolean {
        if (!super.canFix(issue)) {
            return false;
        }

        if (issue.name.includes('psalm')) {
            if (issue.kind === ComparisonKind.FILE_NOT_FOUND) {
                return ['psalm.xml.dist', '.github/workflows/psalm.yml'].includes(issue.name);
            }

            if (issue.kind === ComparisonKind.PACKAGE_NOT_USED) {
                return issue.name === 'vimeo/psalm';
            }

            if (issue.kind === ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND) {
                return true;
            }
        }

        return false;
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        if (this.issue.kind === ComparisonKind.PACKAGE_NOT_USED) {
            new PackageNotUsedFixer(this.issue)
                .fix();
        }

        if (this.issue.kind === ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND) {
            new PackageScriptNotFoundFixer(this.issue)
                .fix();
        }

        if (this.issue.kind === ComparisonKind.FILE_NOT_FOUND) {
            new FileNotFoundFixer(this.issue)
                .fix();
        }

        this.issue.resolve(this);

        return true;
    }

    public static prettyName(): string {
        return 'psalm';
    }
}
