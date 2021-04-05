/* eslint-disable @typescript-eslint/ban-ts-comment */

import { existsSync } from 'fs';
import { basename } from 'path';
import { runCommand } from './helpers';

export class GitUtilties {
    public static displayStatusMessages = false;

    static pullRepo(name: string, path: string) {
        if (existsSync(path)) {
            if (GitUtilties.displayStatusMessages) {
                console.log(`* Updating repository '${basename(path)}'`);
            }
            runCommand('git', ['pull'], path);
        }
    }

    static cloneRepo(name: string, parentPath: string, cloneIntoDir: string | null = null) {
        // @ts-ignore
        cloneIntoDir = cloneIntoDir ?? name.split('/')
            .pop();

        const gitCloneUrl = `https://github.com/${name}.git`;

        if (!existsSync(parentPath + '/' + cloneIntoDir)) {
            if (GitUtilties.displayStatusMessages) {
                console.log(`* Cloning repository '${name}'`);
            }
            // @ts-ignore
            runCommand('git', ['clone', gitCloneUrl, cloneIntoDir], parentPath);
        }
    }
}
