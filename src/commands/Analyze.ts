/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { Repository, RepositoryKind } from '../lib/Repository';
import { Command } from './Command';

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

        // TODO: use Repository class, WIP
        // const skeleton = Repository.create(skeletonPath, RepositoryKind.SKELETON);
        // const repo = Repository.create(repositoryPath, RepositoryKind.PACKAGE);
        // app.compareRepositories(skeleton, repo); return;

        const results = app.compareDotFiles(skeletonPath, repositoryPath);
        app.displayResults(skeletonPath, repositoryPath, results);
    }
}
