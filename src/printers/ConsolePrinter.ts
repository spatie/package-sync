import { app } from '../Application';
import { Repository } from '../lib/Repository';

import Table from 'cli-table3';
import { ComparisonKind } from '../types/FileComparisonResult';

const chalk = require('chalk');

export class ConsolePrinter {
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

    public static printRepositoryIssues(repo: Repository) {
        const table = new Table({
            head: ['issue', 'score', 'filename', 'fixers', 'notes'],
            chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
            style: {
                head: [], //disable colors in header cells
                border: [], //disable colors for the border
            },
            colWidths: [15, 10, 50, 30, 30],
        });

        table.push(['-'.padEnd(12, '-'), '-'.padEnd(8, '-'), '-'.padEnd(45, '-'), '-'.padEnd(25, '-'), '-'.padEnd(25, '-')]);

        repo.issues
            .filter(issue => !issue.resolved)
            .filter(issue => !app.config.ignoreNames.includes(issue.name))
            .filter(issue => !app.config.skipComparisons.includes(issue.name))
            .filter(issue => !app.config.issues.ignored[issue.kind]?.includes(issue.name) ?? true)
            .sort((a, b) => (a.kind + a.score).localeCompare(b.kind + b.score))
            .forEach(issue => {
                table.push([
                    this.kindColor(issue.kind)(issue.kind),
                    issue.score,
                    this.kindColor(issue.kind)(issue.name),
                    issue.availableFixers.join(', '),
                    issue.note?.toString() ?? '',
                ]);
            });

        process.stdout.write(table.toString() + '\n');
    }

    public static printRepositoryFixerResults(repo: Repository) {
        const table = new Table({
            head: ['filename', 'fixer', 'status'],
            chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
            style: {
                head: [], //disable colors in header cells
                border: [], //disable colors for the border
            },
            colWidths: [40, 15, 65],
        });

        table.push(['-'.padEnd(35, '-'), '-'.padEnd(12, '-'), '-'.padEnd(55, '-')]);

        repo.issues
            //.filter(issue => issue.resolved)
            .filter(issue => !app.config.ignoreNames.includes(issue.name))
            .filter(issue => !app.config.skipComparisons.includes(issue.name))
            .filter(issue => !app.config.issues.ignored[issue.kind]?.includes(issue.name) ?? true)
            .sort((a, b) => a.kind.localeCompare(b.kind))
            .forEach(issue => {
                table.push([this.kindColor(issue.kind)(issue.name), issue.resolvedByFixer, issue.resolvedNotes.join('; ')]);
            });

        process.stdout.write(table.toString() + '\n');
    }
}
