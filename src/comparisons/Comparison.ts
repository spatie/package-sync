/* eslint-disable no-unused-vars */

import { Repository } from '../repositories/Repository';
import { RepositoryFile } from '../repositories/RepositoryFile';
import { RepositoryIssue } from '../repositories/RepositoryIssue';
import { ComparisonKind } from '../types/FileComparisonResult';

export abstract class Comparison {
    protected comparisonPassed = false;
    protected _score: number | string | null = null;

    get score() {
        return this._score;
    }

    set score(value: number | string | null) {
        this._score = value;
    }

    constructor(
        public skeleton: Repository,
        public repo: Repository,
        public file: RepositoryFile | null,
        public repoFile: RepositoryFile | null,
    ) {
        //
    }

    static create<T extends Comparison>(
        this: new (...args: any[]) => T,
        skeleton: Repository,
        repo: Repository,
        file: RepositoryFile | null,
        repoFile: RepositoryFile | null,
    ): T {
        return new this(skeleton, repo, file, repoFile);
    }

    public abstract compare(requiredScore: number | null): Comparison;

    public abstract getKind(): ComparisonKind;

    public prettyScore(): string {
        if (this.score === null || this.score === 0) {
            return '-';
        }

        if (typeof this.score === 'string') {
            return this.score;
        }

        return this.score?.toFixed(3) ?? '';
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
                this.file?.relativeName ?? '.',
                this.file,
                this.repoFile,
                this.skeleton,
                this.repo,
                false,
            ),
        );
    }

    public passed(): boolean {
        return this.comparisonPassed;
    }

    public failed(): boolean {
        return !this.passed();
    }

    public meetsRequirement(minimum: number | null): boolean {
        return (this.score ?? 0) >= (minimum ?? 15);
    }
}
