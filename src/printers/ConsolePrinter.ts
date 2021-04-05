import { basename } from 'path';
import { PackageIssue } from '../issues/PackageIssue';

export class ConsolePrinter {
    public printResults(skeletonPath: string, repositoryPath: string, issues: PackageIssue[]) {
        const fullLineSeparator = `| ${'-----'.padEnd(12, '-')} + ${'-----'.padEnd(8, '-')} + ${'--------'.padEnd(20, '-')}\n`;

        process.stdout.write(`\n\n`);
        process.stdout.write(`* comparing package '${basename(repositoryPath)}' against template '${basename(skeletonPath)}'...\n`);
        process.stdout.write(`\n`);
        process.stdout.write(`| ${'issue'.padEnd(12)} | ${'score'.padEnd(8, ' ')} | filename\n`);
        process.stdout.write(fullLineSeparator);

        issues.forEach((issue: PackageIssue) => {
            let scoreStr = '';
            const item = issue.result;

            if (typeof item.score === 'string') {
                scoreStr = item.score.padEnd(7, '0');
            } else {
                scoreStr = item.score === 0 ? '   -' : item.score.toFixed(5);
            }

            process.stdout.write(`| ${item.kind.padEnd(12)} | ${scoreStr.padEnd(7)} | ${item.name}\n`);
        });

        process.stdout.write(`${fullLineSeparator}\n`);
    }
}
