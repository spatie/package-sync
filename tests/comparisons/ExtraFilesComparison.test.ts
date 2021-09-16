/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { ExtraFilesComparison } from '../../src/comparisons/ExtraFilesComparison';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';

let skeleton: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
});

it('passes when there are no files in the repo that are not in the skeleton', () => {
    const repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    const comparisonObj = ExtraFilesComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(comparisonObj.passed())
        .toBeTruthy();
});

it('fails when there are files that exist only in the repo directory', () => {
    const repo = Repository.create(__dirname + '/../data/test-package-2', RepositoryKind.PACKAGE);

    const comparisonObj = ExtraFilesComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(comparisonObj.passed())
        .toBeFalsy();
});

it('does not create issues when there are no files in the repo that are not in the skeleton', () => {
    const repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    const comparisonObj = ExtraFilesComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    expect(repo.issues)
        .toHaveLength(0);
});

it('creates issues when there are files that exist only in the repo directory', () => {
    const repo = Repository.create(__dirname + '/../data/test-package-2', RepositoryKind.PACKAGE);

    const comparisonObj = ExtraFilesComparison.create(skeleton, repo, null, null);

    comparisonObj.compare(null);

    const issues = repo.issues.map(issue => ({
        name: issue.name,
        kind: issue.result.kind,
    }));

    expect(repo.issues.length)
        .toBeGreaterThan(0);
    expect(issues)
        .toMatchSnapshot();
});
