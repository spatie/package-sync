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
        return this.result.score;
    }
}
