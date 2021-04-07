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

    public static options = [
        createOption('file', null, { alias: 'f', type: 'string' }),
        //createOption('risky', false, { alias: 'r' }),
    ];

    static handle(argv: any): void {
        let issueType: string = argv['issueType'] ?? 'all';
        const allowRisky: boolean = argv['risky'] ?? false;

        if (issueType.trim().length === 0) {
            issueType = '*';
        }

        if (issueType === 'all') {
            issueType = '*';
        }

        const { repo } = app.analyzePackage(argv.packageName);

        // if (argv.file !== null) {
        //     issues = issues.filter(issue => issue.name === argv.file);
        // }

        FixerManager.create()
            .fixIssues(
                repo.issues
                    .filter(issue => (argv['file'] ?? null) === null || issue.name === argv.file)
                    .filter(
                        issue =>
                            issueType === '*' ||
                        issue.fixers.map(fixer => fixer.getName())
                            .includes(issueType) ||
                        micromatch.isMatch(issueType, issue.kind) ||
                        micromatch.isMatch(
                            issueType,
                            issue.fixers.map(fixer => fixer.getName()),
                        ),
                    ),
                issueType,
                allowRisky,
            );

        ConsolePrinter.printRepositoryFixerResults(repo);
    }
}
