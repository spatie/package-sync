/* eslint-disable no-undef */

import { existsSync, unlinkSync } from 'fs';
import { FileNotFoundFixer } from '../../../src/issues/fixers/FileNotFoundFixer';
import { RepositoryIssue } from '../../../src/issues/RepositoryIssue';
import { Repository, RepositoryKind } from '../../../src/lib/Repository';
import { ComparisonKind } from '../../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../../data/test-package', RepositoryKind.PACKAGE);
});

it('copies a missing file from skeleton to package', () => {
    const issue = new RepositoryIssue(
        { kind: ComparisonKind.FILE_NOT_FOUND, score: 0 },
        'testfile1.txt',
        skeleton.getFile('testfile1.txt'),
        null,
        skeleton,
        repo,
    );
    const fixer = new FileNotFoundFixer(issue);
    const targetFile = `${issue.repository.path}/${issue.name}`;

    issue.availableFixers.push(fixer.getClass().prettyName());

    expect(existsSync(targetFile)).toBeFalsy();
    expect(fixer.fix()).toBeTruthy();
    expect(existsSync(targetFile)).toBeTruthy();

    unlinkSync(targetFile);
});
