/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */

import { app } from '../Application';
import { Command } from './Command';
import { GitUtilties } from '../lib/GitUtilties';

export default class PullPackageCommand extends Command {
    public static command = 'pull-package <name>';
    public static aliases: string[] = ['pp'];
    public static description = 'Update/retrieve the named package repository';
    public static exports = exports;
    public static options = [];

    static handle(argv: any): void {
        const name = argv.name;

        GitUtilties.displayStatusMessages = true;

        GitUtilties.cloneRepo(app.configuration.qualifiedPackageName(name), app.config.packagesPath);
        GitUtilties.pullRepo(name, app.packagePath(name));
    }
}
