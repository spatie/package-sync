/* eslint-disable no-undef */

import { existsSync, rmdirSync } from 'fs';
import { DirectoryNotFoundFixer } from '../../../src/issues/fixers/DirectoryNotFoundFixer';
import { RepositoryIssue } from '../../../src/repositories/RepositoryIssue';
import { Repository, RepositoryKind } from '../../../src/repositories/Repository';
import { ComparisonKind } from '../../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue, fixer: DirectoryNotFoundFixer;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../../data/test-package', RepositoryKind.PACKAGE);

    issue = new RepositoryIssue(
        { kind: ComparisonKind.DIRECTORY_NOT_FOUND, score: 0 },
        'test_directory_1',
        null,
        null,
        skeleton,
        repo,
    );

    fixer = new DirectoryNotFoundFixer(issue);
});

it('creates a missing directory', () => {
    const targetPath = `${issue.repository.path}/${issue.name}`;

    expect(existsSync(targetPath))
        .toBeFalsy();
    expect(fixer.fix())
        .toBeTruthy();
    expect(existsSync(targetPath))
        .toBeTruthy();

    rmdirSync(targetPath);
});

it("doesn't create a missing directory if the issue is resolved", () => {
    const targetPath = `${issue.repository.path}/${issue.name}`;

    issue.resolve('test');

    expect(existsSync(targetPath))
        .toBeFalsy();
    expect(fixer.fix())
        .toBeFalsy();
    expect(existsSync(targetPath))
        .toBeFalsy();
});
