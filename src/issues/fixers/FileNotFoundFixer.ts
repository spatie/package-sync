/* eslint-disable no-unused-vars */

import { existsSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';

export class FileNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_NOT_FOUND];

    public description() {
        return 'copies a file from the skeleton repository into the package repository.';
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        const relativeFn: string = this.issue.srcFile?.relativeName ?? this.issue.name;

        if (!existsSync(`${this.issue.repository.path}/${relativeFn}`)) {
            const file = File.read(`${this.issue.skeleton.path}/${relativeFn}`);

            file.setContents(file.processTemplate(this.issue.repository.name))
                .saveAs(`${this.issue.repository.path}/${relativeFn}`);
        }

        this.issue.resolve(this)
            .addResolvedNote(`copied file '${relativeFn}' from skeleton`);

        return true;
    }

    public static prettyName(): string {
        return 'create-file';
    }
}
