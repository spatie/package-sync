/* eslint-disable no-unused-vars */

import { Repository } from '../lib/Repository';
import { RepositoryFile } from '../lib/RepositoryFile';
import { ComparisonKind } from '../types/FileComparisonResult';

export class RepositoryIssue {
    constructor(
        public result: any,
        public name: string,
        public srcFile: RepositoryFile | null,
        public destFile: RepositoryFile | null,
        public skeleton: Repository,
        public repository: Repository,
        public resolved: boolean = false,
    ) {
        //
    }

    get kind(): ComparisonKind {
        return this.result.kind;
    }
}
