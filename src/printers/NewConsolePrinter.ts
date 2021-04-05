import { app } from '../Application';
import { Repository } from '../lib/Repository';

export class NewConsolePrinter {
    public static printRepositoryIssues(repo: Repository) {
        const fullLineSeparator =
            `| ${'-----'.padEnd(12, '-')} + ${'-----'.padEnd(8, '-')} + ` +
            `${'-----'.padEnd(16, '-')} + ${'--------'.padEnd(20, '-')}\n`;

        process.stdout.write(`\n`);
        process.stdout.write(`| ${'issue'.padEnd(12)} | ${'score'.padEnd(8, ' ')} | ${'note'.padEnd(16)} | filename\n`);
        process.stdout.write(fullLineSeparator);

        repo.issues
            .filter(issue => !issue.resolved)
            .filter(issue => !app.config.ignoreNames.includes(issue.name))
            .filter(issue => !app.config.skipComparisons.includes(issue.name))
            .filter(issue => !app.config.issues.ignored[issue.kind]?.includes(issue.name) ?? true)
            .sort((a, b) => (a.kind + a.score).localeCompare(b.kind + b.score))
            .forEach(issue => {
                process.stdout.write(`| ${issue.kind.padEnd(12)} | ${issue.score.toString()
                    .padStart(8)} `);
                process.stdout.write(`| ${(issue.note?.toString() ?? '').padEnd(16)} | ${issue.name}\n`);
            });

        process.stdout.write(`${fullLineSeparator}\n`);
    }
}
