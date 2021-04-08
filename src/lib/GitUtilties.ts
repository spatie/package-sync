import { existsSync } from 'fs';
import { basename } from 'path';
import { runCommand } from './helpers';

export class GitUtilties {
    public static displayStatusMessages = false;

    public static runCmd: CallableFunction | null = null;

    static runCommand(cmd: string, args: string[], cwd: string) {
        if (this.runCmd !== null) {
            return this.runCmd(cmd, args, cwd);
        }
        return runCommand(cmd, args, cwd);
    }

    static pullRepo(name: string, path: string) {
        if (existsSync(path)) {
            if (GitUtilties.displayStatusMessages) {
                console.log(`* Updating repository '${basename(path)}'`);
            }

            this.runCommand('git', ['pull'], path);
        }
    }

    static cloneRepo(name: string, parentPath: string, cloneIntoDir: string | null = null) {
        cloneIntoDir = cloneIntoDir ?? (name.split('/')
            .pop() || '');

        const gitCloneUrl = `https://github.com/${name}.git`;

        if (!existsSync(parentPath + '/' + cloneIntoDir)) {
            if (GitUtilties.displayStatusMessages) {
                console.log(`* Cloning repository '${name}'`);
            }

            this.runCommand('git', ['clone', gitCloneUrl, cloneIntoDir], parentPath);
        }
    }
}
