/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { app } from '../Application';
import { Command } from './Command';
import { Repository, RepositoryKind } from '../lib/Repository';
import { ConsolePrinter } from '../printers/ConsolePrinter';
import { FixerManager } from '../issues/FixerManager';

export default class AnalyzeCommand extends Command {
    public static command = 'analyze <packageName>';
    public static aliases = ['a', 'an'];
    public static description = 'Analyze a package using its template/skeleton repository';
    public static exports = exports;

    public static options = [];

    static handle(argv: any): void {
        const skeletonType = argv.packageName.startsWith('laravel-') ? 'laravel' : 'php';
        const templateName = app.configuration.getFullTemplateName(skeletonType);

        const skeletonPath = app.templatePath(templateName);
        const repositoryPath = app.packagePath(argv.packageName);

        const skeleton = Repository.create(skeletonPath, RepositoryKind.SKELETON);
        const repo = Repository.create(repositoryPath, RepositoryKind.PACKAGE);

        app.compareRepositories(skeleton, repo);

        repo.issues.forEach(issue => {
            FixerManager.fixers()
                .forEach(fixer => {
                    if (fixer.fixes(issue.kind) && fixer.canFix(issue)) {
                        issue.availableFixers.push(fixer.prettyName());
                    }
                });
        });

        ConsolePrinter.printRepositoryIssues(repo);
    }
}
