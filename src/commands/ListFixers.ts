/* eslint-disable no-unused-vars */

import { Command } from './Command';
import { ConsolePrinter } from '../printers/ConsolePrinter';
import { RepositoryIssue } from '../issues/RepositoryIssue';
import { FixerRepository } from '../issues/FixerRepository';

export default class ListFixersCommand extends Command {
    public static command = 'fixers';
    public static aliases: string[] = [];
    public static description = 'List all available fixers';
    public static exports = exports;

    public static options = [];

    static handle(): void {
        const fixers = FixerRepository.all()
            .map(fixer => new fixer(<RepositoryIssue>(<unknown>null)));

        ConsolePrinter.printFixerSummary(fixers);
    }
}
