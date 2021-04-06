/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { Command, createOption } from './Command';
import { FixerManager } from '../issues/FixerManager';
import { ConsolePrinter } from '../printers/ConsolePrinter';

const micromatch = require('micromatch');

export default class FixCommand extends Command {
    public static command = 'fix <packageName> [issueType]';
    public static aliases: string[] = [];
    public static description = "Fix a package's issues";
    public static exports = exports;

    public static options = [createOption('file', null, { alias: 'f', type: 'string' })];

    static handle(argv: any): void {
        let issueType = argv.issueType;

        if (issueType.trim().length === 0) {
            issueType = '*';
        }

        if (issueType === 'all') {
            issueType = '*';
        }

        const { skeleton, repo } = app.analyzeRepository(argv.packageName);
        let issues = repo.issues.slice(0);

        if (argv.file !== null) {
            issues = issues.filter(issue => issue.name === argv.file);
        }

        FixerManager.create()
            .fixIssues(
                issues.filter(
                    issue =>
                        issueType === '*' ||
                    micromatch.isMatch(issueType, issue.kind) ||
                    micromatch.isMatch(issueType, issue.availableFixers),
                ),
            );

        ConsolePrinter.printRepositoryFixerResults(repo);
    }
}
