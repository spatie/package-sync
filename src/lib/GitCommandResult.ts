/* eslint-disable no-unused-vars */
import { SpawnSyncReturns } from 'child_process';

export class GitCommandResult {
    constructor(public result: SpawnSyncReturns<string>) {
        //console.log(result.pid);
    }

    get empty() {
        return this.result.output.length > 0;
    }

    get value() {
        return this.result.output.join('\n');
    }

    equals(str: string) {
        return str === this.value;
    }
}
