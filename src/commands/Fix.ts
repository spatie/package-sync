/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { Command, createOption } from './Command';
import { FixerManager } from '../issues/FixerManager';

const micromatch = require('micromatch');

export default class FixCommand extends Command {
    public static command = 'fix <packageName> [issueType]';
    public static aliases: string[] = [];
    public static description = "Fix a package's issues";
    public static exports = exports;

    public static options = [createOption('fixer', undefined, { alias: 'F', type: 'string' })];

    static handle(argv: any): void {
        const skeletonType = argv.packageName.startsWith('laravel-') ? 'laravel' : 'php';
        const templateName = app.configuration.getFullTemplateName(skeletonType);
        const skeletonPath = app.templatePath(templateName);
        const repositoryPath = app.packagePath(argv.packageName);

        console.log('Analyzing package: ' + argv.packageName);

        const results = app.compareDotFiles(skeletonPath, repositoryPath);

        let issueType = argv.issueType;

        if (issueType.trim().length === 0) {
            issueType = '*';
        }
        if (issueType === 'all') {
            issueType = '*';
        }

        FixerManager.create(skeletonPath, repositoryPath)
            .fixIssues(results.filter(r => micromatch.isMatch(r.kind, issueType)));
    }
}
