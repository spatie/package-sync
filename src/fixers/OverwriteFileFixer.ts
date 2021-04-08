/* eslint-disable no-unused-vars */

import { existsSync } from 'fs';
import { ComparisonKind } from '../types/FileComparisonResult';
import { File } from '../lib/File';
import { Fixer } from './Fixer';

export class OverwriteFileFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_NOT_SIMILAR_ENOUGH];

    public description() {
        return 'overwrites an existing file with a newer version from the skeleton.';
    }

    public isRisky(): boolean {
        return true;
    }

    public fix(): boolean {
        if (!this.shouldPerformFix() || this.issue.pending) {
            return false;
        }

        const relativeFn: string = this.issue.srcFile?.relativeName ?? this.issue.name;

        if (existsSync(`${this.issue.repository.path}/${relativeFn}`)) {
            const file = File.read(`${this.issue.skeleton.path}/${relativeFn}`);

            file.setContents(file.processTemplate(this.issue.repository.name))
                .saveAs(`${this.issue.repository.path}/${relativeFn}`);

            this.issue.resolve(this)
                .addResolvedNote(`overwrite file '${relativeFn}' with latest`);
        }

        return true;
    }

    public static prettyName(): string {
        return 'rewrite-file';
    }
}
