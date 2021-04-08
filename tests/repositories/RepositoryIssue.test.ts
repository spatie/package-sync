/* eslint-disable no-undef */
import { RepositoryIssue } from '../../src/repositories/RepositoryIssue';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';
import { FileNotFoundFixer } from '../../src/fixers/FileNotFoundFixer';
import { ComparisonKind } from '../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    issue = new RepositoryIssue({ kind: ComparisonKind.FILE_NOT_FOUND, score: 0 }, '.missing.txt', null, null, skeleton, repo);
});

it('adds a fixer if it has not yet been added', () => {
    const fixer = new FileNotFoundFixer(issue);

    issue.addFixer(fixer);
    issue.addFixer(fixer);

    expect(issue.fixers).toHaveLength(1);
});

it('resolves and sets the name of the fixer when provided a string value', () => {
    expect(issue.resolved).toBeFalsy();

    issue.resolve('FixerName');

    expect(issue.resolved).toBeTruthy();
    expect(issue.resolvedByFixer).toBe('FixerName');
});

it('resolves and sets the name of the fixer when provided a fixer object', () => {
    const fixer = new FileNotFoundFixer(issue);

    expect(issue.resolved).toBeFalsy();

    issue.resolve(fixer);

    expect(issue.resolved).toBeTruthy();
    expect(issue.resolvedByFixer).toBe(fixer.getName());
});

it('appends a resolved note', () => {
    expect(issue.resolvedNotes).toHaveLength(0);

    issue.addResolvedNote('one');
    issue.addResolvedNote('two');

    expect(issue.resolvedNotes).toHaveLength(2);
    expect(issue.resolvedNotes).toStrictEqual(['one', 'two']);
});

it('prepends a resolved note', () => {
    expect(issue.resolvedNotes).toHaveLength(0);

    issue.addResolvedNote('one');
    issue.addResolvedNote('two', true);

    expect(issue.resolvedNotes).toHaveLength(2);
    expect(issue.resolvedNotes).toStrictEqual(['two', 'one']);
});
