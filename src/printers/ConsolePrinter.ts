import { app } from '../Application';
import { Repository } from '../lib/Repository';

import Table from 'cli-table3';

export class ConsolePrinter {
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
                table.push([issue.kind, issue.score, issue.name, issue.availableFixers.join(', '), issue.note?.toString() ?? '']);
            });

        process.stdout.write(table.toString() + '\n');
    }
}
