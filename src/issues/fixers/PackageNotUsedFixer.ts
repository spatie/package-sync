/* eslint-disable no-unused-vars */

//import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class PackageNotUsedFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_NOT_USED];

    public fix(): boolean {
        const relativeFn: string = this.issue.result.name;

        console.log(
            `action: copy '${basename(this.skeletonPath)}/${relativeFn}' over existing file '${basename(
                this.repositoryPath,
            )}/${relativeFn}'`,
        );
        console.log(`action: run git add '${relativeFn}'`);

        return true;
    }

    public static prettyName(): string {
        return 'install-dep';
    }
}
