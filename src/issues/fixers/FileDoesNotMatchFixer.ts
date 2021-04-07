/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';

export class FileDoesNotMatchFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_DOES_NOT_MATCH];

    public description() {
        return 'overwrite a file with the skeleton version to force an exact match.';
    }

    public isRisky(): boolean {
        return true;
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        File.read(this.issue.srcFile?.filename ?? '')
            .saveAs(this.issue.destFile?.filename ?? '');

        this.issue.resolve(this)
            .addResolvedNote(`overwrote existing file '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'overwrite-file';
    }
}
