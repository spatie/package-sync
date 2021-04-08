/* eslint-disable no-undef */
import { FixerManager } from '../../src/fixers/FixerManager';
import { DirectoryNotFoundFixer } from '../../src/fixers/DirectoryNotFoundFixer';
import { FileNotFoundFixer } from '../../src/fixers/FileNotFoundFixer';
import { Configuration } from '../../src/Configuration';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';
import { RepositoryIssue } from '../../src/repositories/RepositoryIssue';
import { ComparisonKind } from '../../src/types/FileComparisonResult';
import { unlinkSync } from 'fs';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue, fixer: FileNotFoundFixer;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package-2', RepositoryKind.PACKAGE);

    issue = new RepositoryIssue({ kind: ComparisonKind.FILE_NOT_FOUND, score: 0 }, 'testfile1.txt', null, null, skeleton, repo);
    fixer = new FileNotFoundFixer(issue);

    issue.fixers.push(fixer);
});

it('gets the class of a fixer based on its name', () => {
    const fixers = [
        FixerManager.getFixerClass(FileNotFoundFixer.prettyName()),
        FixerManager.getFixerClass(DirectoryNotFoundFixer.prettyName()),
    ];

    expect(fixers[0])
        .toBe(FileNotFoundFixer);
    expect(fixers[1])
        .toBe(DirectoryNotFoundFixer);
    expect(FixerManager.getFixerClass('missing'))
        .toBeNull();
    expect(FixerManager.getFixerClass(''))
        .toBeNull();
});

it('correctly checks if a fixer is disabled', () => {
    const config = new Configuration(__dirname + '/../data/index.yml').conf;
    config.fixers.disabled = ['create-file'];

    const fm = new FixerManager(config);

    expect(fm.isFixerDisabled(FileNotFoundFixer))
        .toBeTruthy();
    expect(fm.isFixerDisabled(DirectoryNotFoundFixer))
        .toBeFalsy();
});

it('applies a fixer to an issue', () => {
    const config = new Configuration(__dirname + '/../data/index.yml').conf;
    const fm = new FixerManager(config);

    expect(issue.resolved)
        .toBeFalsy();

    fm.fixIssue(issue, 'all', false);

    expect(issue.resolvedByFixer)
        .toBe(fixer.getName());
    expect(issue.resolved)
        .toBeTruthy();

    unlinkSync(`${repo.path}/${issue.name}`);
});
