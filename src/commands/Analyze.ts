/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { app } from '../Application';
import { Command, createOption } from './Command';
import { ConsolePrinter } from '../printers/ConsolePrinter';
import { config } from '../Configuration';

export default class AnalyzeCommand extends Command {
    public static command = 'analyze <packageName>';
    public static aliases = ['a', 'an'];
    public static description = 'Analyze a package using its template/skeleton repository';
    public static exports = exports;

    public static options = [createOption('config', null, { alias: 'c', type: 'string' })];

    static handle(argv: any): void {
        const { repo } = app.loadConfigFile(argv.config || config.filename)
            .analyzePackage(argv.packageName);

        ConsolePrinter.printTable(ConsolePrinter.printRepositoryIssues(repo));
    }
}
