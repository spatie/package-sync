/* eslint-disable no-unused-vars */

import { FileComparisonResult } from '../types/FileComparisonResult';

export class PackageIssue {
    constructor(
        public result: FileComparisonResult,
        public skeletonPath: string,
        public repositoryPath: string,
        public resolved: boolean = false,
    ) {
        //
    }

    static fromComparison(result: FileComparisonResult) {
        return new PackageIssue(result, result.skeletonPath, result.repositoryPath, false);
    }
}
