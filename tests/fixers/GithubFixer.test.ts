/* eslint-disable no-undef */

import { GithubFixer } from '../../src/fixers/GithubFixer';
import { RepositoryIssue } from '../../src/repositories/RepositoryIssue';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';
import { ComparisonKind } from '../../src/types/FileComparisonResult';
import { rmSync } from 'fs';

let skeleton: Repository, repo: Repository, issues: RepositoryIssue[], fixers: GithubFixer[];

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package-2', RepositoryKind.PACKAGE);
    repo.loadFiles();

    issues = [
        new RepositoryIssue({ kind: ComparisonKind.DIRECTORY_NOT_FOUND, score: 0 }, '.github', null, null, skeleton, repo),
        new RepositoryIssue(
            { kind: ComparisonKind.FILE_NOT_FOUND, score: 0 },
            '.github/some-config-file.yml',
            null,
            null,
            skeleton,
            repo,
        ),
    ];

    fixers = [new GithubFixer(issues[0]), new GithubFixer(issues[1])];
});

it('creates a missing .github directory and files', () => {
    expect(repo.getFile('.github')).toBeNull();
    expect(fixers[0].fix()).toBeTruthy();
    repo.loadFiles();
    expect(repo.getFile('.github')).not.toBeNull();

    expect(repo.getFile('.github/some-config-file.yml')).toBeNull();
    expect(fixers[1].fix()).toBeTruthy();
    repo.loadFiles();
    expect(repo.getFile('.github/some-config-file.yml')).not.toBeNull();

    rmSync(`${repo.path}/.github`, { force: true, recursive: true, maxRetries: 3, retryDelay: 50 });
});

it("doesn't create a .github directory or files if the issue is resolved", () => {
    const fixer = fixers[0];
    const issue = fixer.issue;

    issue.resolve('test');

    expect(repo.getFile('.github')).toBeNull();
    expect(fixer.fix()).toBeFalsy();
    repo.loadFiles();
    expect(repo.getFile('.github')).toBeNull();
});
