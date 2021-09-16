/* eslint-disable no-unused-vars */

import { Command } from './Command';
import { ConsolePrinter } from '../printers/ConsolePrinter';
import { RepositoryIssue } from '../repositories/RepositoryIssue';
import { FixerRepository } from '../fixers/FixerRepository';

export default class ListFixersCommand extends Command {
    public static command = 'fixers';
    public static aliases: string[] = [];
    public static description = 'List all available fixers';
    public static exports = exports;

    public static options = [];

    static handle(): void {
        const fixers = FixerRepository.all()
            .map(fixer => new fixer(<RepositoryIssue>(<unknown>null)));

        ConsolePrinter.printTable(ConsolePrinter.printFixerSummary(fixers));
    }
}
