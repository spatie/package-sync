/* eslint-disable no-unused-vars */

import { mkdirSync } from 'fs';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class DirectoryNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.DIRECTORY_NOT_FOUND];

    public fix(): boolean {
        const relativeFn: string = this.issue.name;

        //console.log(`* action: create directory '${basename(this.issue.repository.path)}/${relativeFn}'`);

        mkdirSync(`${this.issue.repository.path}/${relativeFn}`, { recursive: true });

        this.issue.resolve(DirectoryNotFoundFixer.prettyName());
        this.issue.resolvedNotes.push(`created directory '${relativeFn}'`);

        return true;
    }

    public static prettyName(): string {
        return 'create-dir';
    }
}
