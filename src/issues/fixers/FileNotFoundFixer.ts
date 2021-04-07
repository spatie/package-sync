/* eslint-disable no-unused-vars */

import { existsSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';

export class FileNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_NOT_FOUND];

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        const relativeFn: string = this.issue.srcFile?.relativeName ?? this.issue.name;

        if (!existsSync(`${this.issue.repository.path}/${relativeFn}`)) {
            const data = File.read(`${this.issue.skeleton.path}/${relativeFn}`)
                .processTemplate(basename(this.issue.repository.path));

            writeFileSync(`${this.issue.repository.path}/${relativeFn}`, data, { encoding: 'utf-8' });
        }

        this.issue.resolve(this)
            .addResolvedNote(`copied file '${relativeFn}' from skeleton`);

        return true;
    }

    public static prettyName(): string {
        return 'create-file';
    }
}
