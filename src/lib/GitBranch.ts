/* eslint-disable no-unused-vars */

import { runGitCommand } from './helpers';

export class GitBranch {
    constructor(public name: string) {
        //
    }

    public create() {
        runGitCommand(`branch ${this.name}`);

        return this;
    }

    public checkout(create = true) {
        runGitCommand(`checkout ${create ? '-b' : ''} ${this.name}`);

        return this;
    }

    public exists() {
        return !runGitCommand(`show-ref refs/heads/${this.name}`).empty;
    }

    public isCurrent() {
        return runGitCommand('branch --show-current')
            .equals(this.name);
    }
}
