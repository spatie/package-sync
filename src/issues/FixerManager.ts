/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { DirectoryNotFoundFixer } from './fixers/DirectoryNotFoundFixer';
import { FileDoesNotMatchFixer } from './fixers/FileDoesNotMatchFixer';
import { FileIsNotSimilarEnoughFixer } from './fixers/FileIsNotSimilarEnoughFixer';
import { FileNotFoundFixer } from './fixers/FileNotFoundFixer';
import { Fixer } from './fixers/Fixer';
import { GitFileFixer } from './fixers/GitFileFixer';
import { OptionalPackagesFixer } from './fixers/OptionalPackagesFixer';
import { PackageNotUsedFixer } from './fixers/PackageNotUsedFixer';
import { PackageScriptNotFoundFixer } from './fixers/PackageScriptNotFoundFixer';
import { PsalmFixer } from './fixers/PsalmFixer';
import { RepositoryIssue } from './RepositoryIssue';

const micromatch = require('micromatch');

// test comment

export class FixerManager {
    public static fixers() {
        return [
            ...this.namedFixers(),
            DirectoryNotFoundFixer,
            FileIsNotSimilarEnoughFixer,
            FileDoesNotMatchFixer,
            FileNotFoundFixer,
            PackageNotUsedFixer,
            PackageScriptNotFoundFixer,
        ];
    }

    public static namedFixers() {
        return [GitFileFixer, PsalmFixer, OptionalPackagesFixer];
    }

    constructor(public skeletonPath: string, public repositoryPath: string) {
        //
    }

    static create(skeletonPath: string, repositoryPath: string) {
        return new FixerManager(skeletonPath, repositoryPath);
    }

    public isFixerDisabled(fixer: any): boolean {
        const name = Object.getOwnPropertyDescriptor(fixer, 'name')?.value ?? '';
        const shortName = name.replace(/Fixer$/, '');
        const disabledFixers = app.config.fixers?.disabled ?? [];

        return micromatch.isMatch(name, disabledFixers) || micromatch.isMatch(shortName, disabledFixers);
    }

    public getFixerForIssue(name: string, issue: RepositoryIssue): Fixer | null {
        const fixerClass = FixerManager.fixers()
            .find(fixer => fixer.prettyName() === name) ?? null;

        if (fixerClass) {
            return new fixerClass(issue);
        }

        return null;
    }

    public runNamedFixers(issues: RepositoryIssue[]) {
        const namedFixers = FixerManager.namedFixers();

        // check every issue against each fixer so fixers have a chance to fix multiple related issues
        namedFixers
            .filter(fixer => !this.isFixerDisabled(fixer))
            .forEach(fixer => {
                issues.forEach(issue => {
                    if (issue.availableFixers.length && !issue.availableFixers.includes(fixer.prettyName())) {
                        return;
                    }

                    if (fixer.fixes(issue.kind) && fixer.canFix(issue)) {
                        new fixer(issue)
                            .fix();
                    }
                });
            });
    }

    public fixIssues(issues: RepositoryIssue[]) {
        //const issues = results.map(r => new PackageIssue(r, this.skeletonPath, this.repositoryPath, false));

        this.runNamedFixers(issues);
        issues.forEach(issue => this.fixIssue(issue));
    }

    public fixIssue(issue: RepositoryIssue) {
        const fixers = FixerManager.fixers();

        const fixerObjs: Fixer[] = [];

        if (issue.availableFixers.length) {
            issue.availableFixers.forEach(fixerName => {
                fixerObjs.push(<Fixer>this.getFixerForIssue(fixerName, issue));
            });

            // fixerObjs
            //     .filter(fixer => !this.isFixerDisabled(fixer))
            //     //.filter(fixer => fixer.fixesIssue(issue))
            //     .forEach(fixer => fixer.fix());

            // return;
        }

        fixers
            .filter(fixer => fixerObjs.find(obj => obj.getName() === fixer.prettyName()) !== null || !fixerObjs.length)
            .filter(fixer => !this.isFixerDisabled(fixer))
            .filter(fixer => fixer.fixes(issue.result.kind))
            .filter(fixer => fixer.canFix(issue))
            .forEach(fixer => new fixer(issue)
                .fix());
    }
}
