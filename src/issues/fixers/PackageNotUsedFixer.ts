/* eslint-disable no-unused-vars */

import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class PackageNotUsedFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_NOT_USED];

    public description() {
        return "adds a dependency to the package's composer.json file.";
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        const pkg = this.issue.skeleton.composer.package(this.issue.name);

        this.issue.repository.composer.addPackage(pkg)
            .save();

        this.issue.resolve(this)
            .addResolvedNote(`added package dependency '${this.issue.name}'`);

        return true;
    }

    public static prettyName(): string {
        return 'add-dep';
    }
}
