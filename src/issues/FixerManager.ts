/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { matches } from '../lib/helpers';
import { DirectoryNotFoundFixer } from './fixers/DirectoryNotFoundFixer';
import { FileDoesNotMatchFixer } from './fixers/FileDoesNotMatchFixer';
import { FileIsNotSimilarEnoughFixer } from './fixers/FileIsNotSimilarEnoughFixer';
import { FileNotFoundFixer } from './fixers/FileNotFoundFixer';
import { Fixer } from './fixers/Fixer';
import { GitFileFixer } from './fixers/GitFileFixer';
import { GithubFixer } from './fixers/GithubFixer';
import { OptionalPackagesFixer } from './fixers/OptionalPackagesFixer';
import { OverwriteFileFixer } from './fixers/OverwriteFileFixer';
import { PackageNotUsedFixer } from './fixers/PackageNotUsedFixer';
import { PackageScriptNotFoundFixer } from './fixers/PackageScriptNotFoundFixer';
import { PackageVersionFixer } from './fixers/PackageVersionFixer';
import { PsalmFixer } from './fixers/PsalmFixer';
import { RepositoryIssue } from './RepositoryIssue';

export class FixerManager {
    public static fixers(): any[] {
        return [
            // specific fixers:
            GitFileFixer,
            GithubFixer,
            PsalmFixer,
            OptionalPackagesFixer,
            // generic fixers:
            DirectoryNotFoundFixer,
            FileIsNotSimilarEnoughFixer,
            OverwriteFileFixer,
            FileDoesNotMatchFixer,
            FileNotFoundFixer,
            PackageNotUsedFixer,
            PackageScriptNotFoundFixer,
            PackageVersionFixer,
        ];
    }

    static create() {
        return new FixerManager();
    }

    public isFixerDisabled(fixer: any): boolean {
        const name = Object.getOwnPropertyDescriptor(fixer, 'name')?.value ?? '';
        const shortName = name.replace(/Fixer$/, '');
        const disabledFixers = app.config.fixers?.disabled ?? [];

        return matches([name, shortName], disabledFixers);
    }

    public static getFixerClass(name: string): any | null {
        const result = this.fixers()
            .find(fixer => fixer.prettyName() === name);

        return result ?? null;
    }

    public getFixerForIssue(name: string, issue: RepositoryIssue): Fixer | null {
        const fixerClass = FixerManager.fixers()
            .find(fixer => fixer.prettyName() === name) ?? null;

        if (fixerClass) {
            return new fixerClass(issue);
        }

        return null;
    }

    public fixIssues(issues: RepositoryIssue[]) {
        issues.forEach(async issue => this.fixIssue(issue));
    }

    public fixIssue(issue: RepositoryIssue) {
        const fixers = FixerManager.fixers();
        const fixerObjs: Fixer[] = [];

        if (issue.availableFixers.length) {
            issue.availableFixers.forEach(fixerName => {
                fixerObjs.push(<Fixer>this.getFixerForIssue(fixerName, issue));
            });
        }

        fixers
            .filter(fixer => fixerObjs.find(obj => obj.getName() === fixer.prettyName()) !== null || !fixerObjs.length)
            .filter(fixer => !this.isFixerDisabled(fixer))
            .filter(fixer => fixer.fixes(issue.result.kind))
            .filter(fixer => fixer.canFix(issue))
            .forEach(fixer => {
                new fixer(issue)
                    .fix();
            });
    }
}
