import { ComparisonKind, FileComparisonResult } from '../../types/FileComparisonResult';
import { Composer } from './Composer';

const semver = require('semver');

export class ComposerComparer {
    static compareScripts(skeletonPath: string, repositoryPath: string): FileComparisonResult[] {
        const skeletonComposer = Composer.createFromPath(skeletonPath);
        const repositoryComposer = Composer.createFromPath(repositoryPath);

        return skeletonComposer
            .scripts()
            .filter(script => !repositoryComposer.hasScript(script.name))
            .map(script => {
                return {
                    kind: ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND,
                    score: 0,
                    name: script.name,
                    context: Object.assign({}, script),
                    skeletonPath,
                    repositoryPath,
                };
            });
    }

    static comparePackages(skeletonPath: string, repositoryPath: string): FileComparisonResult[] {
        const skeletonComposer = Composer.createFromPath(skeletonPath);
        const repositoryComposer = Composer.createFromPath(repositoryPath);

        return skeletonComposer
            .packages('all')
            .map(pkg => {
                if (!repositoryComposer.hasPackage(pkg.name, pkg.section)) {
                    return <FileComparisonResult>{
                        kind: ComparisonKind.PACKAGE_NOT_USED,
                        score: 0,
                        name: pkg.name,
                        context: pkg.section,
                        skeletonPath,
                        repositoryPath,
                    };
                }

                const repositoryPackage = repositoryComposer.package(pkg.name);
                const version1 = semver.coerce(pkg.version);
                const version2 = semver.coerce(repositoryPackage.version);

                if (semver.gt(version1, version2)) {
                    const versionDiff = semver.diff(version1, version2);

                    return {
                        kind: ComparisonKind.PACKAGE_VERSION_MISMATCH,
                        score: versionDiff,
                        name: pkg.name,
                        context: pkg,
                        skeletonPath,
                        repositoryPath,
                    };
                }

                return <FileComparisonResult>{ name: '!remove' };
            })
            .filter(item => item.name !== '!remove');
    }
}
