/* eslint-disable no-undef */
import { RepositoryIssue } from '../../src/issues/RepositoryIssue';
import { Repository, RepositoryKind } from '../../src/lib/Repository';

it('resolves and sets the name of the fixer', () => {
    const skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    const repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    const issue = new RepositoryIssue({ kind: 'missing_pkg', score: 0 }, 'test', null, null, skeleton, repo);

    expect(issue.resolved)
        .toBeFalsy();

    issue.resolve('FixerName');

    expect(issue.resolved)
        .toBeTruthy();
    expect(issue.resolvedByFixer)
        .toBe('FixerName');
});
