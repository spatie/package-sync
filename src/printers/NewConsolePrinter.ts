import { app } from '../Application';
import { Repository } from '../lib/Repository';

import Table from 'cli-table3';

export class NewConsolePrinter {
    public static printRepositoryIssues(repo: Repository) {
        // const fullLineSeparator =
        //     `| ${'-----'.padEnd(12, '-')} + ${'-----'.padEnd(8, '-')} + ` +
        //     `${'-----'.padEnd(16, '-')} + ${'--------'.padEnd(20, '-')}\n`;

        // process.stdout.write(`\n`);
        // process.stdout.write(`| ${'issue'.padEnd(12)} | ${'score'.padEnd(8, ' ')} | ${'note'.padEnd(16)} | filename\n`);
        // process.stdout.write(fullLineSeparator);

        const table = new Table({
            head: ['issue', 'score', 'filename', 'fixers', 'notes'],
            chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
            style: {
                head: [], //disable colors in header cells
                border: [], //disable colors for the border
            },
            colWidths: [15, 10, 50, 30, 30], //set the widths of each column (optional)
        });

        table.push(['-'.padEnd(12, '-'), '-'.padEnd(8, '-'), '-'.padEnd(45, '-'), '-'.padEnd(25, '-'), '-'.padEnd(25, '-')]);

        //    table.push(
        //        ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '7 minutes ago']
        //      , ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '8 minutes ago']
        //    );

        repo.issues
            .filter(issue => !issue.resolved)
            .filter(issue => !app.config.ignoreNames.includes(issue.name))
            .filter(issue => !app.config.skipComparisons.includes(issue.name))
            .filter(issue => !app.config.issues.ignored[issue.kind]?.includes(issue.name) ?? true)
            .sort((a, b) => (a.kind + a.score).localeCompare(b.kind + b.score))
            .forEach(issue => {
                table.push([issue.kind, issue.score, issue.name, issue.availableFixers.join(', '), issue.note?.toString() ?? '']);

                // process.stdout.write(`| ${issue.kind.padEnd(12)} | ${issue.score.toString()
                //     .padStart(8)} `);
                // process.stdout.write(`| ${(issue.note?.toString() ?? '').padEnd(16)} | ${issue.name}\n`);
            });

        console.log(table.toString());

        // process.stdout.write(`${fullLineSeparator}\n`);
    }
}
