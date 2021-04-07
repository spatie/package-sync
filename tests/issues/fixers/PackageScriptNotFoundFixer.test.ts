/* eslint-disable no-undef */

import { PackageScriptNotFoundFixer } from '../../../src/issues/fixers/PackageScriptNotFoundFixer';
import { RepositoryIssue } from '../../../src/issues/RepositoryIssue';
import { Repository, RepositoryKind } from '../../../src/lib/Repository';
import { ComparisonKind } from '../../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue, fixer: PackageScriptNotFoundFixer;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../../data/test-package', RepositoryKind.PACKAGE);

    issue = new RepositoryIssue({ kind: ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND, score: 0 }, 'format', null, null, skeleton, repo);

    fixer = new PackageScriptNotFoundFixer(issue);
});

it('copies a missing composer script from skeleton to package', () => {
    expect(repo.composer.hasScript('format'))
        .toBeFalsy();
    expect(fixer.fix())
        .toBeTruthy();
    expect(repo.composer.hasScript('format'))
        .toBeTruthy();

    repo.composer.removeScript('format')
        .save();
});

it("doesn't add a missing composer script if the issue is resolved", () => {
    issue.resolve('test');

    expect(repo.composer.hasScript('format'))
        .toBeFalsy();
    expect(fixer.fix())
        .toBeFalsy();
    expect(repo.composer.hasScript('format'))
        .toBeFalsy();
});
