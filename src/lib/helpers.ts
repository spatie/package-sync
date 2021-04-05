import { spawnSync } from 'child_process';
import { lstatSync, readdirSync } from 'fs';
import { basename } from 'path';
import { File } from './File';

export function isDirectory(path: string): boolean {
    try {
        const stat = lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}

export function fileSize(fn: string): number {
    return File.create(fn).sizeOnDisk;
}

export function getFileList(directory: string, basePath: string | null = null, recursive = true) {
    const result: string[] = [];

    readdirSync(directory)
        .filter(f => !['.', '..', '.git', '.idea', '.vscode', 'node_modules', 'vendor'].includes(basename(f)))
        .forEach(fn => {
            const fqName = `${directory}/${fn}`;

            result.push(fqName);

            if (recursive && isDirectory(fqName)) {
                result.push(...getFileList(fqName, basePath || directory, recursive));
            }
        });

    return uniqueArray(result);
}

export function uniqueArray(a: any[]): any[] {
    return [...new Set(a)];
}

export function uniqueStrings(arr: string[], allowEmptyLines = true, sortResult = false): string[] {
    const result: string[] = [];

    for (let i = 0, l = arr.length; i < l; i++) {
        if (allowEmptyLines && arr[i].trim().length === 0) {
            result.push('');
            continue;
        }

        if (result.indexOf(arr[i]) === -1) {
            result.push(arr[i]);
        }
    }

    if (sortResult) {
        return result.sort();
    }

    return result;
}

export function runCommand(cmd: string, args: string[], cwd: string | undefined = undefined, stdio: any = 'inherit') {
    return spawnSync(cmd, args, { cwd: cwd, stdio: stdio, encoding: 'utf8', env: process.env });
}
