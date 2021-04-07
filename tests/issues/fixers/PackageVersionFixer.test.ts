/* eslint-disable no-undef */

import { PackageVersionFixer } from '../../../src/issues/fixers/PackageVersionFixer';
import { RepositoryIssue } from '../../../src/issues/RepositoryIssue';
import { Repository, RepositoryKind } from '../../../src/lib/Repository';
import { ComparisonKind } from '../../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue, fixer: PackageVersionFixer;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../../data/test-package-2', RepositoryKind.PACKAGE);

    issue = new RepositoryIssue(
        { kind: ComparisonKind.PACKAGE_VERSION_MISMATCH, score: 0 },
        'phpunit/phpunit',
        null,
        null,
        skeleton,
        repo,
    );

    fixer = new PackageVersionFixer(issue);

    issue.availableFixers.push(fixer.getClass()
        .prettyName());
});

it('updates a dependency version', () => {
    repo.composer.setPackageVersion({ name: 'phpunit/phpunit', section: 'require-dev', version: '^8.0|^9.3' }, '^8.0|^9.3')
        .save();

    expect(repo.composer.package('phpunit/phpunit').version)
        .toBe('^8.0|^9.3');
    expect(fixer.fix())
        .toBeTruthy();
    expect(repo.composer.package('phpunit/phpunit').version)
        .toBe('^8.0|^9.5');

    repo.composer.setPackageVersion({ name: 'phpunit/phpunit', section: 'require-dev', version: '^8.0|^9.3' }, '^8.0|^9.3')
        .save();
});

it("doesn't update a dependency version if the issue is resolved", () => {
    issue.resolve('test');

    expect(repo.composer.package('phpunit/phpunit').version)
        .toBe('^8.0|^9.3');
    expect(fixer.fix())
        .toBeFalsy();
    expect(repo.composer.package('phpunit/phpunit').version)
        .toBe('^8.0|^9.3');
});
