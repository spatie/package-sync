/* eslint-disable no-unused-vars */

import { existsSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { File } from '../../lib/File';
import { Fixer } from './Fixer';
import { RepositoryIssue } from '../RepositoryIssue';

export class PsalmFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_NOT_USED, ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND, ComparisonKind.FILE_NOT_FOUND];

    public fixesIssue(issue: RepositoryIssue): boolean {
        return PsalmFixer.canFix(issue);
    }

    public static canFix(issue: RepositoryIssue): boolean {
        if (issue.resolved) {
            return false;
        }

        if (issue.name.includes('psalm')) {
            if (issue.kind === ComparisonKind.FILE_NOT_FOUND) {
                return ['psalm.xml.dist', '.github/workflows/psalm.yml'].includes(issue.name);
            }

            if (issue.kind === ComparisonKind.PACKAGE_NOT_USED) {
                return issue.result.name === 'vimeo/psalm';
            }

            if (issue.kind === ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND) {
                return true;
            }
        }

        return false;
    }

    protected copyComposerScript(name: string) {
        const script = this.issue.skeleton.composer.script(name);

        this.issue.repository.composer.addScript(script)
            .save();
    }

    protected copyComposerPackage(name: string) {
        const pkg = this.issue.skeleton.composer.package(name);

        this.issue.repository.composer.addPackage(pkg)
            .save();
    }

    public fix(): boolean {
        if (this.issue.resolved) {
            return false;
        }

        if (this.issue.kind === ComparisonKind.PACKAGE_NOT_USED) {
            this.issue.resolved = true;

            this.copyComposerPackage(this.issue.name);
        }

        if (this.issue.kind === ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND) {
            this.issue.resolved = true;

            this.copyComposerScript(this.issue.name);
        }

        if (this.issue.kind === ComparisonKind.FILE_NOT_FOUND) {
            //this.issue.resolved = true;

            if (!existsSync(`${this.issue.repository.path}/${this.issue.name}`)) {
                const data = File.read(this.issue.sourcefile.filename)
                    .processTemplate(basename(this.issue.repository.path));

                writeFileSync(`${this.issue.repository.path}/${this.issue.name}`, data, { encoding: 'utf-8' });
            }
        }

        this.issue.resolve(PsalmFixer.prettyName());
        this.issue.resolvedNotes.push(`fixed '${this.issue.kind}' for '${this.issue.name}`);

        console.log(`PSALM FIXER: fixed '${this.issue.kind}' issue for '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'psalm-setup';
    }
}
