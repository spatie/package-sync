/* eslint-disable no-undef */

import { realpathSync } from 'fs';
import { GitUtilties } from '../../src/lib/GitUtilties';

let runCmdData: string[] = [];
const runCmd = function (cmd: string, args: string[], cwd: string) {
    const baseDir = realpathSync(__dirname + '/../..');

    runCmdData.push(`${cmd} ${args.join(' ')} ${cwd.split('/')
        .pop()}`.trim());

    runCmdData = runCmdData.map(line => line.replace(baseDir, '.'));
};

beforeEach(() => {
    runCmdData = [];
    GitUtilties.runCmd = runCmd;
});

it("does not run any git commands to pull a repository when the target dir doesn't exist", () => {
    GitUtilties.pullRepo('vendorname/some-repo-name', 'temp');

    expect(runCmdData)
        .toHaveLength(0);
});

it('runs a git command to pull a repository when the target dir exists', () => {
    GitUtilties.pullRepo('vendorname/some-repo-name', __dirname);

    expect(runCmdData)
        .toMatchSnapshot();
});

it("runs the correct git command to clone a repository when the target dir doesn't exist", () => {
    GitUtilties.cloneRepo('vendorname/some-repo-name', 'temp', 'target-dir');

    expect(runCmdData)
        .toMatchSnapshot();
    expect(runCmdData.join('')
        .startsWith('git clone'))
        .toBeTruthy();
});

it("doesn't run a git command to clone a repository when the target dir exists", () => {
    GitUtilties.cloneRepo('vendorname/some-repo-name', realpathSync(__dirname + '/../data'), 'test-package-2');

    expect(runCmdData)
        .toHaveLength(0);
});
