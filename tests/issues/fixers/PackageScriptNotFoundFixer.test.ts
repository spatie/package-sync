/* eslint-disable no-undef */

import { PackageScriptNotFoundFixer } from '../../../src/issues/fixers/PackageScriptNotFoundFixer';
import { RepositoryIssue } from '../../../src/issues/RepositoryIssue';
import { Repository, RepositoryKind } from '../../../src/lib/Repository';
import { ComparisonKind } from '../../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../../data/test-package', RepositoryKind.PACKAGE);
});

it('copies a missing composer script from skeleton to package', () => {
    const issue = new RepositoryIssue(
        { kind: ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND, score: 0 },
        'format',
        null,
        null,
        skeleton,
        repo,
    );
    const fixer = new PackageScriptNotFoundFixer(issue);

    issue.availableFixers.push(fixer.getClass()
        .prettyName());

    expect(repo.composer.hasScript('format'))
        .toBeFalsy();
    expect(fixer.fix())
        .toBeTruthy();
    expect(repo.composer.hasScript('format'))
        .toBeTruthy();

    repo.composer.removeScript('format')
        .save();
});
