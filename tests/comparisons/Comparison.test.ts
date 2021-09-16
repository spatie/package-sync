/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { Comparison } from '../../src/comparisons/Comparison';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';
import { ComparisonKind } from '../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);
});

class TestComparison extends Comparison {
    public compare(requiredScore: number | null) {
        this.comparisonPassed = (requiredScore ?? 0) > 1;
        return this;
    }

    public getKind(): ComparisonKind {
        return ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED;
    }

    public setPassed(value: boolean) {
        this.comparisonPassed = value;
    }
}

test('it can be created using create()', () => {
    const comparisonObj = TestComparison.create(skeleton, repo, skeleton.files[0], repo.files[0]);

    expect(comparisonObj)
        .toBeInstanceOf(TestComparison);
});

test('it returns the correct value when the comparison passes', () => {
    const comparisonObj = TestComparison.create(skeleton, repo, skeleton.files[0], repo.files[0]);

    comparisonObj.compare(2);

    expect(comparisonObj.passed())
        .toBeTruthy();
});

test('it returns the correct value when the comparison fails', () => {
    const comparisonObj = TestComparison.create(skeleton, repo, skeleton.files[0], repo.files[0]);

    comparisonObj.compare(0);

    expect(comparisonObj.passed())
        .toBeFalsy();
});
