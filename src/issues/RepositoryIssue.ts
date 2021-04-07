/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../types/FileComparisonResult';
import { Repository } from '../lib/Repository';
import { RepositoryFile } from '../lib/RepositoryFile';

export class RepositoryIssue {
    protected _availableFixers: string[] = [];
    protected _disabledFixers: string[] = [];

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

    get availableFixers() {
        return this._availableFixers.sort(a => (a === 'user-review' ? -1 : 0))
            .filter(name => !this.disabledFixers.includes(name));
    }

    get disabledFixers() {
        return this._disabledFixers;
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

    public resolve(resolvedByFixer: string) {
        this.resolvedByFixer = resolvedByFixer;
        this.resolved = true;

        return this;
    }

    public addResolvedNote(note: string) {
        this.resolvedNotes.push(note);

        return this;
    }

    public disableFixers(names: string[] | null = null) {
        if (names === null) {
            this._disabledFixers = this._availableFixers.slice(0);
            return this;
        }

        names.forEach(name => this._disabledFixers.push(name));

        return this;
    }

    public enableFixers(names: string[] | null = null) {
        if (names === null) {
            this._disabledFixers = [];
            return this;
        }

        this._disabledFixers = this._disabledFixers.filter(name => !names.includes(name));

        return this;
    }
}
