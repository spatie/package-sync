/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { FileSizeComparison } from '../../src/comparisons/FileSizeComparison';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';

let skeleton: Repository, repo: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);
});

test('it passes when comparing the sizes of identical files', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'phpunit.xml.dist');
    const repoFile = repo.files.find(file => file.basename === 'phpunit.xml.dist');

    const comparisonObj = FileSizeComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(15);

    expect(comparisonObj.passed())
        .toBeTruthy();
});

test('it fails when comparing the sizes of different files', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'composer.json');
    const repoFile = repo.files.find(file => file.basename === 'composer.json');

    const comparisonObj = FileSizeComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(15);

    expect(comparisonObj.passed())
        .toBeFalsy();
});

test('it does not create an issue after passing', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'phpunit.xml.dist');
    const repoFile = repo.files.find(file => file.basename === 'phpunit.xml.dist');

    const comparisonObj = FileSizeComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(15);

    expect(repo.issues)
        .toHaveLength(0);
});

test('it creates an issue after failing', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'composer.json');
    const repoFile = repo.files.find(file => file.basename === 'composer.json');

    const comparisonObj = FileSizeComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(15);

    expect(repo.issues)
        .toHaveLength(1);
});

test('it returns a pretty score with a trailing percent sign', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'composer.json');
    const repoFile = repo.files.find(file => file.basename === 'composer.json');

    const comparisonObj = FileSizeComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(15);

    expect(comparisonObj.prettyScore()
        .slice(-1))
        .toBe('%');
});
