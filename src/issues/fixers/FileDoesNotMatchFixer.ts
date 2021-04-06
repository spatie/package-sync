/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';

export class FileDoesNotMatchFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_DOES_NOT_MATCH];

    public fix(): boolean {
        const sourceFn = `${this.issue.skeletonPath}/${this.issue.result.name}`;
        const targetFn = `${this.issue.repositoryPath}/${this.issue.result.name}`;

        File.read(sourceFn)
            .saveAs(targetFn);

        console.log(`FILE MISMATCH FIXER: overwrote the package file '${this.issue.result.name}' with the template repo file`);

        return true;
    }

    public static prettyName(): string {
        return 'overwrite-file';
    }
}
