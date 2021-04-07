import { app } from '../Application';
import { Repository } from '../lib/Repository';

import Table from 'cli-table3';
import { ComparisonKind } from '../types/FileComparisonResult';
import Fixer from '../issues/fixers/Fixer';

const chalk = require('chalk');

const colorText = (text: string, kind: ComparisonKind) => ConsolePrinter.kindColor(kind)(text);

export class ConsolePrinter {
    protected static makeTable(columns: Record<string, number>): Table.Table {
        const headerSep: string[] = [];

        const table = new Table({
            head: Object.keys(columns),
            chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
            style: {
                head: [], //disable colors in header cells
                border: [], //disable colors for the border
            },
            colWidths: Object.values(columns),
            //rowHeights: Object.keys(columns).map(c => { return 2; }),
        });

        Object.values(columns)
            .forEach(w => {
                headerSep.push('-'.padEnd(w > 3 ? w - 3 : w, '-'));
            });

        table.push(headerSep);

        return table;
    }

    public static printTable(table: Table.Table) {
        process.stdout.write(table.toString() + '\n');
    }

    public static kindColor(kind: ComparisonKind) {
        const colors = {
            [ComparisonKind.DIRECTORY_NOT_FOUND]: '#7DD3FC', //#3B82F6',
            [ComparisonKind.FILE_NOT_FOUND]: '#7DD3FC', //#3B82F6',
            [ComparisonKind.PACKAGE_NOT_USED]: '#818CF8',
            [ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND]: '#10B981',
            [ComparisonKind.PACKAGE_VERSION_MISMATCH]: '#A78BFA',
            [ComparisonKind.FILE_NOT_SIMILAR_ENOUGH]: '#0EA5E9', //#475569',
            [ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED]: '#64748B',
            [ComparisonKind.FILE_NOT_IN_SKELETON]: '#64748B',
        };

        const color = colors[kind] ?? '#FAFAF9';

        return chalk.hex(color);
    }

    public static printFixerSummary(fixers: Fixer[]) {
        const table = this.makeTable({
            'fixer name': 18,
            type: 8,
            description: 75,
        });

        fixers
            .sort((a, b) => a.getName()
                .localeCompare(b.getName()))
            .forEach(fixer => {
                let type = '',
                    name = fixer.getName();
                const desc = fixer.description()
                    .replace(/(?![^\n]{1,73}$)([^\n]{1,73})\s/g, '$1\n'); // wrap at 73 chars

                if (fixer.runsFixers()) {
                    name = chalk.hex('#60A5FA')(name);
                    type = chalk.hex('#60A5FA')('multi');
                }

                if (fixer.isRisky()) {
                    name = chalk.hex('#FCA5A5')(name);
                    type = chalk.hex('#FCA5A5')('risky');
                }

                table.push([name, type, desc]);
            });

        this.printTable(table);
    }

    public static printRepositoryIssues(repo: Repository) {
        const table = this.makeTable({
            issue: 15,
            score: 10,
            filename: 50,
            fixers: 30,
            notes: 30,
        });

        repo.issues
            .filter(issue => !issue.resolved)
            .filter(issue => !app.config.ignoreNames.includes(issue.name))
            .filter(issue => !app.config.skipComparisons.includes(issue.name))
            .filter(issue => !app.config.issues.ignored[issue.kind]?.includes(issue.name) ?? true)
            .sort((a, b) => (a.kind + a.score).localeCompare(b.kind + b.score))
            .forEach(issue => {
                const fixers = issue.fixers
                    .map(fixer => {
                        // display risky fixers in red
                        if (fixer.isRisky()) {
                            return chalk.hex('#FCA5A5')(fixer.getName());
                        }
                        // multi fixers in blue
                        if (fixer.runsFixers()) {
                            return chalk.hex('#60A5FA')(fixer.getName());
                        }
                        // safe fixer in green
                        return chalk.hex('#4ADE80')(fixer.getName());
                    })
                    .join(', ');

                table.push([
                    colorText(issue.kind, issue.kind),
                    issue.score,
                    colorText(issue.name, issue.kind),
                    fixers,
                    issue.note?.toString() ?? '',
                ]);
            });

        this.printTable(table);
    }

    public static printRepositoryFixerResults(repo: Repository) {
        const table = this.makeTable({ filename: 40, fixer: 15, status: 65 });

        repo.issues
            .filter(issue => !app.config.ignoreNames.includes(issue.name))
            .filter(issue => !app.config.skipComparisons.includes(issue.name))
            .filter(issue => !app.config.issues.ignored[issue.kind]?.includes(issue.name) ?? true)
            .sort((a, b) => a.kind.localeCompare(b.kind))
            .forEach(issue => {
                if (issue.resolvedByFixer === 'none') {
                    issue.resolvedByFixer = '-';
                    issue.addResolvedNote('issue unresolved');
                }

                table.push([colorText(issue.name, issue.kind), issue.resolvedByFixer, issue.resolvedNotes.join('; ')]);
            });

        this.printTable(table);
    }
}
