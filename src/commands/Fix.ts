/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { Command, createOption } from './Command';
import { FixerManager } from '../issues/FixerManager';
import { Repository, RepositoryKind } from '../lib/Repository';

const micromatch = require('micromatch');

export default class FixCommand extends Command {
    public static command = 'fix <packageName> [issueType]';
    public static aliases: string[] = [];
    public static description = "Fix a package's issues";
    public static exports = exports;

    public static options = [createOption('fixer', undefined, { alias: 'F', type: 'string' })];

    static handle(argv: any): void {
        // const skeletonType = argv.packageName.startsWith('laravel-') ? 'laravel' : 'php';
        // const templateName = app.configuration.getFullTemplateName(skeletonType);
        // const skeletonPath = app.templatePath(templateName);
        // const repositoryPath = app.packagePath(argv.packageName);

        // console.log('Analyzing package: ' + argv.packageName);

        // const results = app.compareDotFiles(skeletonPath, repositoryPath);

        let issueType = argv.issueType;

        if (issueType.trim().length === 0) {
            issueType = '*';
        }
        if (issueType === 'all') {
            issueType = '*';
        }

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
                // if (fixer.fixes(issue.kind)) {
                //     if ((issue.note?.length ?? 0) > 0) {
                //     //
                //     } else {
                //         issue.note = 'fix available';
                //     }
                //     issue.note += ' ' + fixer.prettyName();
                // }
                });
        });

        FixerManager.create(skeletonPath, repositoryPath)
            .fixIssues(
                repo.issues.filter(issue => micromatch.isMatch(issueType, issue.kind)),
            );
    }
}
