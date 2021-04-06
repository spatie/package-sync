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
        const fixerMgr = FixerManager.create(skeletonPath, repositoryPath);

        app.compareRepositories(skeleton, repo);

        repo.issues.forEach(issue => {
            FixerManager.fixers()
                .forEach(fixer => {
                    if (fixer.fixes(issue.kind) && fixer.canFix(issue)) {
                        issue.availableFixers.push(fixer.prettyName());
                    }
                });
        });

        fixerMgr.fixIssues(
            repo.issues.filter(
                issue =>
                    issueType === '*' ||
                    micromatch.isMatch(issueType, issue.kind) ||
                    micromatch.isMatch(issueType, issue.availableFixers),
            ),
        );
    }
}
