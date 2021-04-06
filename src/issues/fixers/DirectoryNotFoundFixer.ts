/* eslint-disable no-unused-vars */

import { mkdirSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class DirectoryNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.DIRECTORY_NOT_FOUND];

    public fix(): boolean {
        const relativeFn: string = this.issue.result.name;

        console.log(`* action: create directory '${basename(this.repositoryPath)}/${relativeFn}'`);

        mkdirSync(`${this.repositoryPath}/${relativeFn}`, { recursive: true });

        return true;
    }

    public static prettyName(): string {
        return 'create-dir';
    }
}
