/* eslint-disable no-undef */

import { PackageNotUsedFixer } from '../../../src/fixers/PackageNotUsedFixer';
import { RepositoryIssue } from '../../../src/repositories/RepositoryIssue';
import { Repository, RepositoryKind } from '../../../src/repositories/Repository';
import { ComparisonKind } from '../../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue, fixer: PackageNotUsedFixer;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../../data/test-package-2', RepositoryKind.PACKAGE);

    issue = new RepositoryIssue({ kind: ComparisonKind.PACKAGE_NOT_USED, score: 0 }, 'vimeo/psalm', null, null, skeleton, repo);
    fixer = new PackageNotUsedFixer(issue);
});

it('copies a missing composer package dependency from skeleton to package', () => {
    expect(repo.composer.hasPackage('vimeo/psalm', 'require-dev'))
        .toBeFalsy();
    expect(fixer.fix())
        .toBeTruthy();
    expect(repo.composer.hasPackage('vimeo/psalm', 'require-dev'))
        .toBeTruthy();

    repo.composer.removePackage({ name: 'vimeo/psalm', section: 'require-dev', version: '' })
        .save();
});

it("doesn't add a missing composer package dependency if the issue is resolved", () => {
    issue.resolve('test');

    expect(repo.composer.hasPackage('vimeo/psalm', 'require-dev'))
        .toBeFalsy();
    expect(fixer.fix())
        .toBeFalsy();
    expect(repo.composer.hasPackage('vimeo/psalm', 'require-dev'))
        .toBeFalsy();
});
