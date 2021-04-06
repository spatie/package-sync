/* eslint-disable no-unused-vars */
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class PackageScriptNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND];

    public fix(): boolean {
        if (this.issue.resolved) {
            return false;
        }

        const script = this.issue.skeleton.composer.script(this.issue.name);

        this.issue.repository.composer.addScript(script)
            .save();

        console.log(`* PACKAGE SCRIPT FIXER: add composer script '${this.issue.name}'`);

        this.issue.resolve(PackageScriptNotFoundFixer.prettyName());
        this.issue.resolvedNotes.push(`added composer script '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'copy-script';
    }
}
