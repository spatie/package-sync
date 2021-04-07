/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../types/FileComparisonResult';
import { Repository } from '../lib/Repository';
import { RepositoryFile } from '../lib/RepositoryFile';
import Fixer from './fixers/Fixer';
import { classOf } from '../lib/helpers';

export class RepositoryIssue {
    protected _fixers: Fixer[] = [];
    protected _availableFixers: string[] = [];

    public resolvedByFixer = 'none';
    public resolvedNotes: string[] = [];

    public pending = false;

    constructor(
        public result: any,
        public name: string,
        public srcFile: RepositoryFile | null,
        public destFile: RepositoryFile | null,
        public skeleton: Repository,
        public repository: Repository,
        public resolved: boolean = false,
        public note: string | null = null,
        public context: any | null = null,
    ) {
        //
    }

    get fixers() {
        const same = (a, b, method) => (a[method]() && b[method]()) || (!a[method]() && !b[method]());
        const isTrue = (a, method) => (a[method]() ? 1 : -1);
        const methodCompare = (a, b, method) => (same(a, b, method) ? 0 : isTrue(a, method));

        return this._fixers.sort((a, b) => methodCompare(a, b, 'runsFixers'))
            .sort((a, b) => methodCompare(a, b, 'isRisky'));
    }

    get availableFixers() {
        return this._availableFixers.sort(a => (a === 'user-review' ? -1 : 0));
    }

    get kind(): ComparisonKind {
        return this.result.kind;
    }

    get score(): number | string {
        if (this.result.score === 0) {
            return '-';
        }

        if (typeof this.result.score === 'number') {
            return this.result.score.toFixed(3);
        }

        return this.result.score;
    }

    get sourcefile(): RepositoryFile {
        return <RepositoryFile>this.srcFile;
    }

    get targetfile(): RepositoryFile {
        return <RepositoryFile>this.destFile;
    }

    public addFixer(fixer: Fixer) {
        if (this.fixers.find(f => f.getName() === fixer.getName()) === undefined) {
            this.fixers.push(fixer);
        }

        return this;
    }

    public is(kind: ComparisonKind): boolean {
        return this.kind === kind;
    }

    public resolve(resolvedByFixer: string | Fixer) {
        if (typeof resolvedByFixer !== 'string') {
            resolvedByFixer = classOf(resolvedByFixer)
                .prettyName();
        }

        this.resolvedByFixer = <string>resolvedByFixer;
        this.resolved = true;

        return this;
    }

    public addResolvedNote(note: string) {
        this.resolvedNotes.push(note);

        return this;
    }

    public disableFixers(names: string[] | null = null) {
        if (names === null) {
            names = this.fixers.map(fixer => fixer.getName());
        }

        this.fixers.forEach(fixer => {
            if (names?.includes(fixer.getName())) {
                fixer.disable();
            }
        });

        return this;
    }

    public enableFixers(names: string[] | null = null) {
        if (names === null) {
            names = this.fixers.map(fixer => fixer.getName());
        }

        this.fixers.forEach(fixer => {
            if (names?.includes(fixer.getName())) {
                fixer.enable();
            }
        });

        return this;
    }
}
