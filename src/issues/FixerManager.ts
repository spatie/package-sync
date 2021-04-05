/* eslint-disable no-unused-vars */

import { FileComparisonResult } from '../types/FileComparisonResult';
import { DirectoryNotFoundFixer } from './fixers/DirectoryNotFoundFixer';
import { FileDoesNotMatchFixer } from './fixers/FileDoesNotMatchFixer';
import { FileIsNotSimilarEnoughFixer } from './fixers/FileIsNotSimilarEnoughFixer';
import { FileNotFoundFixer } from './fixers/FileNotFoundFixer';
import { GitFileFixer } from './fixers/GitFileFixer';
import { OptionalPackagesFixer } from './fixers/OptionalPackagesFixer';
import { PackageNotUsedFixer } from './fixers/PackageNotUsedFixer';
import { PackageScriptNotFoundFixer } from './fixers/PackageScriptNotFoundFixer';
import { PsalmFixer } from './fixers/PsalmFixer';
import { PackageIssue } from './PackageIssue';

export class FixerManager {
    constructor(public skeletonPath: string, public repositoryPath: string) {
        //
    }

    static create(skeletonPath: string, repositoryPath: string) {
        return new FixerManager(skeletonPath, repositoryPath);
    }

    public fixIssues(results: FileComparisonResult[]) {
        const issues = results.map(r => new PackageIssue(r, this.skeletonPath, this.repositoryPath, false));

        this.runNamedFixers(issues);
        issues.forEach(issue => this.fixIssue(issue));
    }

    public runNamedFixers(issues: PackageIssue[]) {
        const namedFixers = [GitFileFixer, PsalmFixer, OptionalPackagesFixer];

        // check every issue against each fixer so fixers have a chance to fix multiple related issues
        namedFixers.forEach(fixer => {
            issues.forEach(issue => {
                if (fixer.fixes(issue.result.kind) && fixer.canFix(issue)) {
                    new fixer(this.skeletonPath, this.repositoryPath, issue)
                        .fix();
                }
            });
        });
    }

    public fixIssue(issue: PackageIssue) {
        const fixers = [
            DirectoryNotFoundFixer,
            FileIsNotSimilarEnoughFixer,
            FileDoesNotMatchFixer,
            FileNotFoundFixer,
            PackageNotUsedFixer,
            PackageScriptNotFoundFixer,
        ];

        fixers
            .filter(fixer => fixer.fixes(issue.result.kind))
            .filter(fixer => fixer.canFix(issue))
            .forEach(fixer => new fixer(issue.skeletonPath, issue.repositoryPath, issue)
                .fix());
    }
}
