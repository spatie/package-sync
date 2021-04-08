/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { Command, createOption } from './Command';
import { FixerManager } from '../fixers/FixerManager';
import { ConsolePrinter } from '../printers/ConsolePrinter';
import { matches } from '../lib/helpers';
import { config } from '../Configuration';

export default class FixCommand extends Command {
    public static command = 'fix <packageName> [issueType]';
    public static aliases: string[] = [];
    public static description = "Fix a package's issues";
    public static exports = exports;

    public static options = [
        createOption('config', null, { alias: 'c', type: 'string' }),
        createOption('file', null, { alias: 'f', type: 'string' }),
    ];

    static handle(argv: any): void {
        let issueType: string = (argv['issueType'] ?? 'all').trim()
            .toLowerCase();

        const allowRisky: boolean = argv['risky'] ?? false;

        if (issueType.trim().length === 0) {
            issueType = '*';
        }

        if (issueType === 'all') {
            issueType = '*';
        }

        const { repo } = app.loadConfigFile(argv.config || config.filename)
            .analyzePackage(argv.packageName);

        const nameMap = fixers => fixers.map(fixer => fixer.getName());

        FixerManager.create()
            .fixIssues(
                repo.issues
                    .filter(issue => (argv['file'] ?? null) === null || issue.name === argv.file)
                    .filter(
                        issue =>
                            issueType === '*' ||
                        nameMap(issue.fixers)
                            .includes(issueType) ||
                        matches(issueType, issue.kind) ||
                        matches(issueType, nameMap(issue.fixers)),
                    ),
                issueType,
                allowRisky,
            );

        ConsolePrinter.printTable(ConsolePrinter.printRepositoryFixerResults(repo));
    }
}
