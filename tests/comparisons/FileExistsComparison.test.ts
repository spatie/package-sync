/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { FileExistsComparison } from '../../src/comparisons/FileExistsComparison';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';

let skeleton: Repository, repo: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);
});

test('it passes when checking if an existing file exists', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'phpunit.xml.dist');

    const comparisonObj = FileExistsComparison.create(skeleton, repo, skelFile ?? null, null);

    comparisonObj.compare(null);

    expect(comparisonObj.passed())
        .toBeTruthy();
});

test('it fails when checking if a missing file exists', () => {
    const comparisonObj = FileExistsComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(comparisonObj.passed())
        .toBeFalsy();
});

test('it does not create an issue after passing', () => {
    const skelFile = skeleton.files.find(file => file.basename === 'phpunit.xml.dist');

    const comparisonObj = FileExistsComparison.create(skeleton, repo, skelFile ?? null, null);

    comparisonObj.compare(null);

    expect(repo.issues)
        .toHaveLength(0);
});

test('it creates an issue after failing', () => {
    const comparisonObj = FileExistsComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(repo.issues)
        .toHaveLength(1);
});
