/* eslint-disable no-unused-vars */

import { existsSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';

export class FileNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_NOT_FOUND];

    public fix(): boolean {
        const relativeFn: string = this.issue.result.name;

        console.log(`* action: copy file '${relativeFn}' into '${basename(this.repositoryPath)}'`);

        if (!existsSync(`${this.repositoryPath}/${relativeFn}`)) {
            const data = File.read(`${this.skeletonPath}/${relativeFn}`)
                .processTemplate(basename(this.repositoryPath));

            writeFileSync(`${this.repositoryPath}/${relativeFn}`, data, { encoding: 'utf-8' });
        }

        return true;
    }

    public static prettyName(): string {
        return 'create-file';
    }
}
