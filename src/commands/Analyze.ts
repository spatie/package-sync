/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { app } from '../Application';
import { Command } from './Command';
import { ConsolePrinter } from '../printers/ConsolePrinter';
import { RepositoryValidator } from '../lib/RepositoryValidator';
import { RepositoryKind } from '../lib/Repository';

export default class AnalyzeCommand extends Command {
    public static command = 'analyze <packageName>';
    public static aliases = ['a', 'an'];
    public static description = 'Analyze a package using its template/skeleton repository';
    public static exports = exports;

    public static options = [];

    static handle(argv: any): void {
        const { repo } = app.analyzePackage(argv.packageName);

        ConsolePrinter.printRepositoryIssues(repo);
    }
}
