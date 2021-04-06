/* eslint-disable no-unused-vars */

import { existsSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Composer } from '../../lib/composer/Composer';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';
import { PackageIssue } from '../PackageIssue';

export class PsalmFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_NOT_USED, ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND, ComparisonKind.FILE_NOT_FOUND];

    public static canFix(issue: PackageIssue): boolean {
        if (issue.resolved) {
            return false;
        }

        if (issue.result.name.includes('psalm')) {
            if (issue.result.kind === ComparisonKind.FILE_NOT_FOUND) {
                return ['psalm.xml.dist', '.github/workflows/psalm.yml'].includes(issue.result.name);
            }

            if (issue.result.kind === ComparisonKind.PACKAGE_NOT_USED) {
                return issue.result.name === 'vimeo/psalm';
            }

            if (issue.result.kind === ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND) {
                return true;
            }
        }

        return false;
    }

    protected copyComposerScript(name: string) {
        const skeletonComposer = Composer.create(`${this.issue.skeletonPath}/composer.json`);
        const repositoryComposer = Composer.create(`${this.issue.repositoryPath}/composer.json`);
        const script = skeletonComposer.script(name);

        repositoryComposer.addScript(script)
            .save();
    }

    protected copyComposerPackage(name: string) {
        const skeletonComposer = Composer.create(`${this.issue.skeletonPath}/composer.json`);
        const repositoryComposer = Composer.create(`${this.issue.repositoryPath}/composer.json`);
        const pkg = skeletonComposer.package(name);

        repositoryComposer.addPackage(pkg)
            .save();
    }

    public fix(): boolean {
        const relativeFn: string = this.issue.result.name;

        if (this.issue.result.kind === ComparisonKind.PACKAGE_NOT_USED) {
            this.issue.resolved = true;

            this.copyComposerPackage(this.issue.result.name);
        }

        if (this.issue.result.kind === ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND) {
            this.issue.resolved = true;

            this.copyComposerScript(this.issue.result.name);
        }

        if (this.issue.result.kind === ComparisonKind.FILE_NOT_FOUND) {
            this.issue.resolved = true;

            if (!existsSync(`${this.repositoryPath}/${relativeFn}`)) {
                const data = File.read(`${this.skeletonPath}/${relativeFn}`)
                    .processTemplate(basename(this.repositoryPath));

                writeFileSync(`${this.repositoryPath}/${relativeFn}`, data, { encoding: 'utf-8' });
            }
        }

        console.log(`PSALM FIXER: fixed '${this.issue.result.kind}' issue for '${this.issue.result.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'psalm-setup';
    }
}
