/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';

export class FileDoesNotMatchFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_DOES_NOT_MATCH];

    public fix(): boolean {
        // const sourceFn = `${this.issue.skeleton.path}/${this.issue.result.name}`;
        // const targetFn = `${this.issue.repository.path}/${this.issue.result.name}`;

        File.read(this.issue.srcFile?.filename ?? '')
            .saveAs(this.issue.destFile?.filename ?? '');

        //console.log(`FILE MISMATCH FIXER: overwrote the package file '${this.issue.name}' with the template repo file`);

        this.issue.resolve(FileDoesNotMatchFixer.prettyName());
        this.issue.resolvedNotes.push(`overwrote existing file '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'overwrite-file';
    }
}
