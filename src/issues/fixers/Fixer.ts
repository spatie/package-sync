/* eslint-disable no-unused-vars */

import { app } from '../../Application';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { RepositoryIssue } from '../RepositoryIssue';

export abstract class Fixer {
    public static handles: ComparisonKind[] = [];

    public constructor(public issue: RepositoryIssue) {
        //
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
}
