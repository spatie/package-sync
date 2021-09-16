/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ComparisonKind } from '../types/FileComparisonResult';
import { Comparison } from './Comparison';
import { Composer } from '../lib/composer/Composer';
import { RepositoryIssue } from '../repositories/RepositoryIssue';

const semver = require('semver');

export class ComposerPackagesComparison extends Comparison {
    protected kind: ComparisonKind = ComparisonKind.PACKAGE_NOT_USED;

    protected getVersionDiff(repoVersion: string, newVersion: string): string | null {
        const newPart = newVersion.split('|')
            .pop() ?? '0.0';
        const repoPart = repoVersion.split('|')
            .pop() ?? '0.0';

        const diff = semver.diff(semver.coerce(newPart), semver.coerce(repoPart));

        return ['major', 'minor', 'patch'].includes(diff) ? diff : null;
    }

    public compare(requiredScore: number | null): Comparison {
        this.score = 0;

        const skeletonComposer = Composer.createFromPath(this.skeleton.path);
        const repositoryComposer = Composer.createFromPath(this.repo.path);

        let issueCounter = 0;

        skeletonComposer.packages('all')
            .forEach(pkg => {
                if (!repositoryComposer.hasPackage(pkg.name, pkg.section)) {
                    this.kind = ComparisonKind.PACKAGE_NOT_USED;
                    this.score = 0;

                    this.createIssue({
                        name: pkg.name,
                        context: pkg.section,
                        skeletonPath: this.skeleton.path,
                        repositoryPath: this.repo.path,
                    });

                    issueCounter++;

                    return;
                }

                const repositoryPackage = repositoryComposer.package(pkg.name);
                const versionDiff = this.getVersionDiff(repositoryPackage.version, pkg.version);

                // treat version strings like '^8.1|^9.5' and '^9.5' as a non-issue
                if (repositoryPackage.version.includes(pkg.version)) {
                    return;
                }

                if (versionDiff !== null) {
                    this.kind = ComparisonKind.PACKAGE_VERSION_MISMATCH;
                    this.score = versionDiff;

                    this.createIssue({
                        name: pkg.name,
                        context: pkg,
                        skeletonPath: this.skeleton.path,
                        repositoryPath: this.repo.path,
                    });

                    issueCounter++;

                    return;
                }
            });

        this.comparisonPassed = issueCounter === 0;

        return this;
    }

    public getKind(): ComparisonKind {
        return this.kind;
    }

    public meetsRequirement(percentage): boolean {
        return true;
    }

    protected createIssue(additional: Record<string, unknown> | null): void {
        const compareResult = {
            kind: this.getKind(),
            score: this.prettyScore(),
            ...(additional ?? {}),
        };

        this.repo.issues.push(
            new RepositoryIssue(
                compareResult,
                // @ts-ignore
                compareResult.name,
                this.file,
                this.repoFile,
                this.skeleton,
                this.repo,
                false,
            ),
        );
    }
}
