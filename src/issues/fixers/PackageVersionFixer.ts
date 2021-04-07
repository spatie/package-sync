/* eslint-disable no-unused-vars */
import { last, uniqueArray } from '../../lib/helpers';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

const semver = require('semver');

export class PackageVersionFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_VERSION_MISMATCH];

    public description() {
        return 'updates the version of a dependency in the package repository.';
    }

    /**
     * merges two version strings like '^6.0|^7.1` and '^7.2' into '^6.0|^7.2'.
     *
     * @param repoVersion the 'old' version
     * @param newVersion the 'new' version
     * @returns {string}
     */
    public mergeVersions(repoVersion: string, newVersion: string) {
        const repoVersionParts = repoVersion.split('|')
            .sort();
        const newVersionParts = newVersion.split('|')
            .sort();

        const versions = Array(repoVersionParts.length);
        const newVersions: string[] = [];

        for (let i = 0; i < versions.length; i++) {
            const newPart = newVersionParts[i] ?? newVersionParts[newVersionParts.length - 1];
            const repoPart = repoVersionParts[i] ?? repoVersionParts[repoVersionParts.length - 1];

            if (!semver.gt(semver.coerce(newPart), semver.coerce(repoPart))) {
                versions[i] = repoPart;
                continue;
            }

            const diff = semver.diff(semver.coerce(newPart), semver.coerce(repoPart));

            if (diff === 'major') {
                versions[i] = repoPart;
                newVersions.push(newPart);
            } else {
                versions[i] = newPart;
            }
        }

        versions.push(...newVersions);

        if (newVersionParts.length > repoVersionParts.length) {
            versions.push(...newVersionParts.slice(repoVersionParts.length - 1));
        }

        return uniqueArray(versions)
            .sort()
            .join('|');
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return false;
        }

        const newPkg = this.issue.skeleton.composer.package(this.issue.name);
        const repoPkg = this.issue.repository.composer.package(this.issue.name);
        const mergedVersion = this.mergeVersions(repoPkg.version, newPkg.version);

        this.issue.repository.composer.setPackageVersion(repoPkg, mergedVersion)
            .save();

        this.issue.resolve(this)
            .addResolvedNote(`updated version to '${repoPkg.version}'`);

        return true;
    }

    public static prettyName(): string {
        return 'bump-version';
    }
}
