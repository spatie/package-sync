import { spawnSync } from 'child_process';
import { existsSync, lstatSync, readdirSync, statSync } from 'fs';
import { basename } from 'path';

const micromatch = require('micromatch');

export function isDirectory(path: string): boolean {
    try {
        const stat = lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
        //
    }
}

export function fileSize(fn: string): number {
    if (!existsSync(fn)) {
        return 0;
    }

    const stat = statSync(fn);

    if (!stat.isFile()) {
        return 0;
    }

    return stat.size;
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

export const last = (arr: any[]) => arr[arr.length - 1] ?? undefined;

export function classOf<T>(o: T): any {
    return (o as any).constructor;
}

export function matches(str: string | string[], patterns: string | string[]): boolean {
    if (!Array.isArray(str)) {
        str = [str];
    }

    for (const s of str) {
        if (micromatch.isMatch(s, patterns)) {
            return true;
        }
    }

    return false;
}
