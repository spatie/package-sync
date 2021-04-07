/* eslint-disable no-unused-vars */
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class PackageScriptNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND];

    public description() {
        return "adds a missing composer script to the package's composer.json file.";
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        const script = this.issue.skeleton.composer.script(this.issue.name);

        this.issue.repository.composer.addScript(script)
            .save();

        this.issue.resolve(this)
            .addResolvedNote(`added composer script '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'copy-script';
    }
}
