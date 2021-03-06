/* eslint-disable no-undef */

import { PackageVersionFixer } from '../../src/fixers/PackageVersionFixer';
import { RepositoryIssue } from '../../src/repositories/RepositoryIssue';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';
import { ComparisonKind } from '../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue, fixer: PackageVersionFixer;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package-2', RepositoryKind.PACKAGE);

    issue = new RepositoryIssue(
        { kind: ComparisonKind.PACKAGE_VERSION_MISMATCH, score: 0 },
        'phpunit/phpunit',
        null,
        null,
        skeleton,
        repo,
    );

    fixer = new PackageVersionFixer(issue);
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

it('merges version strings', () => {
    expect(fixer.mergeVersions('^6.0', '^6.5'))
        .toBe('^6.5');
    expect(fixer.mergeVersions('^6.0', '^7.0'))
        .toBe('^6.0|^7.0');
    expect(fixer.mergeVersions('^6.0|^7.0', '^6.0|^7.1'))
        .toBe('^6.0|^7.1');
    expect(fixer.mergeVersions('^6.0|^7.0', '^6.1|^7.1'))
        .toBe('^6.1|^7.1');
    expect(fixer.mergeVersions('^6.0', '^6.0|^7.1'))
        .toBe('^6.0|^7.1');
    expect(fixer.mergeVersions('^6.0|^7.0', '^7.5'))
        .toBe('^6.0|^7.5');
    expect(fixer.mergeVersions('^6.0|^7.0', '^7.0.1'))
        .toBe('^6.0|^7.0.1');
    expect(fixer.mergeVersions('^6.0|^7.1.1', '^7.2'))
        .toBe('^6.0|^7.2');
    expect(fixer.mergeVersions('^6.0|^7.1.1', '^8.2'))
        .toBe('^6.0|^7.1.1|^8.2');
    expect(fixer.mergeVersions('~3.8.0|^4.0|^5.0|^6.0', '^6.15'))
        .toBe('~3.8.0|^4.0|^5.0|^6.15');
});
