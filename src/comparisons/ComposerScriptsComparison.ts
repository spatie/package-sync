/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ComparisonKind } from '../types/FileComparisonResult';
import { Comparison } from './Comparison';
import { Composer } from '../lib/composer/Composer';
import { RepositoryIssue } from '../repositories/RepositoryIssue';

export class ComposerScriptsComparison extends Comparison {
    protected kind: ComparisonKind = ComparisonKind.FILE_NOT_FOUND;

    public compare(requiredScore: number | null): Comparison {
        this.score = 0;

        const skeletonComposer = Composer.createFromPath(this.skeleton.path);
        const repositoryComposer = Composer.createFromPath(this.repo.path);

        const missingScripts = skeletonComposer.scripts()
            .filter(script => !repositoryComposer.hasScript(script.name));

        this.comparisonPassed = missingScripts.length === 0;

        if (!this.comparisonPassed) {
            missingScripts.forEach(script => {
                this.createIssue({
                    name: script.name,
                    context: Object.assign({}, script),
                    skeletonPath: this.skeleton.path,
                    repositoryPath: this.repo.path,
                });
            });
        }

        return this;
    }

    public getKind(): ComparisonKind {
        return ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND;
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
                // @ts-ignore
                compareResult,
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
