/* eslint-disable no-unused-vars */
import { Composer } from '../../lib/composer/Composer';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class PackageScriptNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND];

    public fix(): boolean {
        const skeletonComposer = Composer.createFromPath(this.issue.skeletonPath);
        const repositoryComposer = Composer.createFromPath(this.issue.repositoryPath);
        const script = skeletonComposer.script(this.issue.result.name);

        repositoryComposer.addScript(script)
            .save();

        console.log(`* PACKAGE SCRIPT FIXER: add composer script '${this.issue.result.name}'`);

        this.issue.resolved = true;

        return true;
    }
}
