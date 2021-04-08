/* eslint-disable no-unused-vars */

import { classOf } from '../lib/helpers';
import { ComparisonKind } from '../types/FileComparisonResult';
import { RepositoryIssue } from '../repositories/RepositoryIssue';

export class Fixer {
    public enabled = true;

    public static handles: ComparisonKind[] = [];

    public constructor(public issue: RepositoryIssue) {
        //
    }

    description() {
        return '';
    }

    getName() {
        return this.getClass()
            .prettyName();
    }

    getClass() {
        return classOf(this);
    }

    public fix(): boolean {
        return false;
    }

    public isRisky(): boolean {
        return false;
    }

    public runsFixers(): boolean {
        return false;
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
            .canFix(issue);
    }

    protected shouldPerformFix() {
        return !this.issue.resolved && this.enabled;
    }
}

export default Fixer;
