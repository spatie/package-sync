/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { StringComparison } from '../../src/comparisons/StringComparison';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';

let skeleton: Repository, repo: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);
});

test('it passes when comparing the contents of identical files', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'phpunit.xml.dist');
    const repoFile = repo.files.find(file => file.basename === 'phpunit.xml.dist');

    const comparisonObj = StringComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(0.8);

    expect(comparisonObj.passed())
        .toBeTruthy();
});

test('it fails when comparing the contents of different files', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'composer.json');
    const repoFile = repo.files.find(file => file.basename === 'composer.json');

    const comparisonObj = StringComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(0.9);

    expect(comparisonObj.passed())
        .toBeFalsy();
});

test('it does not create an issue after passing', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'phpunit.xml.dist');
    const repoFile = repo.files.find(file => file.basename === 'phpunit.xml.dist');

    const comparisonObj = StringComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(0.8);

    expect(repo.issues)
        .toHaveLength(0);
});

test('it creates an issue after failing', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'composer.json');
    const repoFile = repo.files.find(file => file.basename === 'composer.json');

    const comparisonObj = StringComparison.create(skeleton, repo, skelFile ?? null, repoFile ?? null);

    comparisonObj.compare(0.9);

    expect(repo.issues)
        .toHaveLength(1);
});
