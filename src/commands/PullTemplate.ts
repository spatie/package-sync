/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { Command } from './Command';
import { GitUtilties } from '../lib/GitUtilties';

export default class PullTemplateCommand extends Command {
    public static command = 'pull-template [name]';
    public static aliases: string[] = ['pt'];
    public static description = 'Update/retrieve the named skeleton repository, or both if not specified (can be "php" or "laravel")';
    public static exports = exports;
    public static options = [];

    static handle(argv: any): void {
        const argvName = argv.name ?? '';

        const shortTemplateName = (longName: string) => {
            return longName.split('-')
                .pop() ?? longName;
        };

        app.config.templates.names
            .filter(name => shortTemplateName(name) === argvName || argvName === '')
            .forEach(name => {
                GitUtilties.displayStatusMessages = true;

                GitUtilties.cloneRepo(app.configuration.qualifiedTemplateName(name), app.config.templatesPath);
                GitUtilties.pullRepo(name, app.templatePath(name));
            });
    }
}
