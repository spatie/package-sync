/* eslint-disable no-unused-vars */

import { mkdirSync } from 'fs';
import { classOf } from '../../lib/helpers';
import { ComparisonKind } from '../../types/FileComparisonResult';
import Fixer from './Fixer';

export class DirectoryNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.DIRECTORY_NOT_FOUND];

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        mkdirSync(`${this.issue.repository.path}/${this.issue.name}`, { recursive: true });

        this.issue.resolve(classOf(this)
            .prettyName())
            .addResolvedNote(`created directory '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'create-dir';
    }
}
