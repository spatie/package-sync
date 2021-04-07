/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { matches, uniqueArray } from '../lib/helpers';
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
    public static fixers() {
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

    public isIssueIgnored(issue: RepositoryIssue): boolean {
        return app.config.issues.ignored[issue.kind]?.includes(issue.name) ?? false;
    }

    public static getFixerClass(name: string): any | null {
        const result = FixerManager.fixers()
            .find(fixer => fixer.prettyName() === name);

        if (result === undefined) {
            return null;
        }

        return result;
    }

    public getFixerForIssue(name: string, issue: RepositoryIssue): Fixer | null {
        const fixerClass = FixerManager.fixers()
            .find(fixer => fixer.prettyName() === name) ?? null;

        if (fixerClass) {
            // @ts-ignore
            return new fixerClass(issue);
        }

        return null;
    }

    public fixIssues(issues: RepositoryIssue[], issueTypeOrFixer: string, allowRisky: boolean) {
        issues //.filter(issue => !this.isIssueIgnored(issue))
            .forEach(issue => this.fixIssue(issue, issueTypeOrFixer, allowRisky));
    }

    public fixIssue(issue: RepositoryIssue, issueTypeOrFixer: string, allowRisky: boolean) {
        const fixers = issue.fixers
            .filter(fixer => !this.isFixerDisabled(fixer.getClass()))
            .filter(fixer => fixer.getClass()
                .canFix(issue))
            .slice(0);

        let skippedFixers: string[] = [];
        let fixer = fixers.find(fixer => fixer.getName() === issueTypeOrFixer);
        const onlyRunOnce = fixer === undefined;

        if (fixer === undefined) {
            fixer = fixers.shift() ?? undefined;
        }

        let counter = 0;

        while (!issue.resolved && fixer !== undefined) {
            counter++;

            if (onlyRunOnce && counter > 1) {
                return;
            }

            if (fixer === undefined) {
                return;
            }

            if (issue.resolved) {
                return;
            }

            if (!allowRisky && fixer.isRisky()) {
                skippedFixers.push(fixer.getName());
                fixer = fixers.shift() ?? undefined;

                continue;
            }

            if (fixer.fix()) {
                return issue.resolve(fixer);
            }

            fixer = fixers.shift() ?? undefined;
        }

        skippedFixers = uniqueArray(skippedFixers);

        if (skippedFixers.length > 1) {
            issue.addResolvedNote(`skipped ${skippedFixers.length} fixers (risky)`);
        } else if (skippedFixers.length === 1) {
            issue.addResolvedNote(`skipped ${skippedFixers[0]} (risky)`);
        }

        if (!issue.resolved) {
            issue.addResolvedNote(`unresolved`, true);
        }
    }
}
