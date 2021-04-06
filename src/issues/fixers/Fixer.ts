/* eslint-disable no-unused-vars */

import { app } from '../../Application';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { PackageIssue } from '../PackageIssue';

export abstract class Fixer {
    public static handles: ComparisonKind[] = [];

    public constructor(public skeletonPath: string, public repositoryPath: string, public issue: PackageIssue) {
        //
    }
    public abstract fix(): boolean;

    static config() {
        const thisName = (Object.getOwnPropertyDescriptor(this, 'name')?.value ?? 'Fixer').replace(/Fixer$/, '');

        return app.config.fixers[thisName] || null;
    }

    public static canFix(issue: PackageIssue): boolean {
        return !issue.resolved;
    }

    public static fixes(kind: ComparisonKind): boolean {
        return this.handles.includes(kind);
    }

    public static prettyName(): string {
        return this.name;
    }
}
