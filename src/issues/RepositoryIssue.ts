/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../types/FileComparisonResult';
import { Repository } from '../lib/Repository';
import { RepositoryFile } from '../lib/RepositoryFile';

export class RepositoryIssue {
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
}
