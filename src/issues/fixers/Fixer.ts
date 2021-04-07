/* eslint-disable no-unused-vars */

import { app } from '../../Application';
import { classOf } from '../../lib/helpers';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { RepositoryIssue } from '../RepositoryIssue';
export abstract class Fixer {
    public enabled = true;

    public static handles: ComparisonKind[] = [];

    public constructor(public issue: RepositoryIssue) {
        //
    }

    getName() {
        return Fixer.prettyName();
    }

    getClass() {
        return classOf(this);
    }
    public abstract fix(): boolean;

    static config() {
        const thisName = (Object.getOwnPropertyDescriptor(this, 'name')?.value ?? 'Fixer').replace(/Fixer$/, '');

        return app.config.fixers[thisName] || null;
    }

    public static canFix(issue: RepositoryIssue): boolean {
        return !issue.resolved;
    }

    public static fixes(kind: ComparisonKind): boolean {
        return this.handles.includes(kind);
    }

    public static prettyName(): string {
        return this.name;
    }

    public disable() {
        this.enabled = false;
    }

    public enable() {
        this.enabled = true;
    }

    public fixesIssue(issue: RepositoryIssue) {
        return this.getClass()
            .fixes(issue.kind) && this.getClass()
            .canFix(issue) && this.enabled;
    }

    protected shouldPerformFix() {
        return !this.issue.resolved && this.enabled && this.issue.availableFixers.includes(this.getClass()
            .prettyName());
    }
}
