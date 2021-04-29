/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { ComposerScriptsComparison } from '../../src/comparisons/ComposerScriptsComparison';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';

let skeleton: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
});

it('passes when the composer scripts have no differences', () => {
    const repo = Repository.create(__dirname + '/../data/test-package-3', RepositoryKind.PACKAGE);

    const comparisonObj = ComposerScriptsComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(comparisonObj.passed())
        .toBeTruthy();
});

it('fails when the composer scripts have differences', () => {
    const repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    const comparisonObj = ComposerScriptsComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(comparisonObj.passed())
        .toBeFalsy();
});

it('does not create issues when the composer scripts have no differences', () => {
    const repo = Repository.create(__dirname + '/../data/test-package-3', RepositoryKind.PACKAGE);

    const comparisonObj = ComposerScriptsComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(repo.issues)
        .toHaveLength(0);
});

it('creates issues when the composer scripts have differences', () => {
    const repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    const comparisonObj = ComposerScriptsComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(repo.issues.length)
        .toBeGreaterThan(0);
});
