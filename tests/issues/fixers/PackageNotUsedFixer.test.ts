/* eslint-disable no-undef */

import { PackageNotUsedFixer } from '../../../src/issues/fixers/PackageNotUsedFixer';
import { RepositoryIssue } from '../../../src/issues/RepositoryIssue';
import { Repository, RepositoryKind } from '../../../src/lib/Repository';
import { ComparisonKind } from '../../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../../data/test-package-2', RepositoryKind.PACKAGE);
});

it('copies a missing composer package dependency from skeleton to package', () => {
    const issue = new RepositoryIssue({ kind: ComparisonKind.PACKAGE_NOT_USED, score: 0 }, 'vimeo/psalm', null, null, skeleton, repo);
    const fixer = new PackageNotUsedFixer(issue);

    issue.availableFixers.push(fixer.getClass()
        .prettyName());

    expect(repo.composer.hasPackage('vimeo/psalm', 'require-dev'))
        .toBeFalsy();
    expect(fixer.fix())
        .toBeTruthy();
    expect(repo.composer.hasPackage('vimeo/psalm', 'require-dev'))
        .toBeTruthy();

    repo.composer.removePackage({ name: 'vimeo/psalm', section: 'require-dev', version: '' })
        .save();
});
