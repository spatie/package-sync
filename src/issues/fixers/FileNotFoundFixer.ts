/* eslint-disable no-unused-vars */

import { existsSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';

export class FileNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_NOT_FOUND];

    public fix(): boolean {
        const relativeFn: string = this.issue.srcFile?.relativeName ?? this.issue.name;

        console.log(`* action: copy file '${relativeFn}' into '${basename(this.issue.repository.path)}'`);

        if (!existsSync(`${this.issue.repository.path}/${relativeFn}`)) {
            const data = File.read(`${this.issue.skeleton.path}/${relativeFn}`)
                .processTemplate(basename(this.issue.repository.path));

            writeFileSync(`${this.issue.repository.path}/${relativeFn}`, data, { encoding: 'utf-8' });

            this.issue.resolve(FileNotFoundFixer.prettyName());
            this.issue.resolvedNotes.push(`copy file '${relativeFn}' into '${this.issue.repository.name}'`);
        }

        return true;
    }

    public static prettyName(): string {
        return 'create-file';
    }
}
