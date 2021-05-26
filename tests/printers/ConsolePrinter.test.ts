/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FileNotFoundFixer } from '../../src/fixers/FileNotFoundFixer';
import { MergeFilesFixer } from '../../src/fixers/MergeFilesFixer';
import { PsalmFixer } from '../../src/fixers/PsalmFixer';
import { ConsolePrinter } from '../../src/printers/ConsolePrinter';
import { Repository, RepositoryKind } from '../../src/repositories/Repository';
import { RepositoryIssue } from '../../src/repositories/RepositoryIssue';
import { ComparisonKind } from '../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue, fixer: FileNotFoundFixer;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../data/test-package-2', RepositoryKind.PACKAGE);
    //repo.loadFiles();

    issue = new RepositoryIssue({ kind: ComparisonKind.FILE_NOT_FOUND, score: 0 }, 'testfile1.txt', null, null, skeleton, repo);
    fixer = new FileNotFoundFixer(issue);

    issue.fixers.push(fixer); // safe fixer
    issue.fixers.push(new MergeFilesFixer(issue)); // risky fixer
    issue.fixers.push(new PsalmFixer(issue)); // multi fixer

    repo.issues.push(issue);
});

it('prints a summary of fixers', () => {
    const output = ConsolePrinter.printFixerSummary(issue.fixers).toString()
        .toLowerCase()
        .trim();

    expect(output).toMatchSnapshot();
});

it("prints a repository's issues", () => {
    const output = ConsolePrinter.printRepositoryIssues(repo).toString()
        .toLowerCase()
        .trim();

    expect(output).toMatchSnapshot();
});

it("prints repository's fixed issues", () => {
    repo.issues[0].resolve(repo.issues[0].fixers[0]);

    const output = ConsolePrinter.printRepositoryFixerResults(repo).toString()
        .toLowerCase()
        .trim();

    expect(output).toMatchSnapshot();
});
