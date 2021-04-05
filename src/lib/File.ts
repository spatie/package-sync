/* eslint-disable no-unused-vars */

import { rmdirSync, existsSync, readFileSync, writeFileSync, unlinkSync, statSync } from 'fs';
import { basename, extname } from 'path';
import { isDirectory } from './helpers';

export enum FileType {
    FILE = 'file',
    DIRECTORY = 'directory',
}

export class File {
    protected data: string | null = null;
    protected type: FileType;

    constructor(protected fn: string, contents: string | null = null) {
        this.type = FileType.FILE;

        if (this.exists()) {
            this.type = isDirectory(fn) ? FileType.DIRECTORY : FileType.FILE;
        }

        this.data = contents;
    }

    static create(fn: string, contents: string | null = null) {
        return new File(fn, contents);
    }

    static read(fn: string) {
        return new File(fn)
            .load();
    }

    static contents(fn: string | null): string {
        if (!fn) {
            return '';
        }

        if (!fn.length) {
            return '';
        }

        return <string>File.create(fn).contents;
    }

    get filename() {
        return this.fn;
    }

    set filename(value: string) {
        this.fn = value;
    }

    get contents() {
        if (this.isDirectory()) {
            return '';
        }

        if (this.data === null) {
            this.load();
        }

        return this.data ?? '';
    }

    get sizeOnDisk() {
        if (this.isDirectory()) {
            return 0;
        }

        if (!this.exists()) {
            return 0;
        }

        const stat = statSync(this.fn);

        if (!stat.isFile()) {
            return 0;
        }

        return stat.size;
    }

    get basename() {
        return basename(this.fn);
    }

    get extension() {
        return extname(this.fn);
    }

    public isDirectory() {
        return this.type === FileType.DIRECTORY;
    }

    public isFile() {
        return this.type === FileType.FILE;
    }

    public load() {
        if (!this.isFile()) {
            return this;
        }

        this.data = readFileSync(this.fn, { encoding: 'utf-8' });

        return this;
    }

    public save() {
        return this.saveAs(this.fn);
    }

    public saveAs(fn: string) {
        if (this.isFile()) {
            writeFileSync(fn, this.data ?? '');
        }

        return this;
    }

    public delete() {
        if (this.isFile()) {
            unlinkSync(this.fn);
        }

        if (this.isDirectory()) {
            rmdirSync(this.fn);
        }

        return this;
    }

    public exists() {
        return existsSync(this.fn);
    }

    public setContents(data: string) {
        this.data = data;

        return this;
    }

    public processTemplate(repoName: string): string {
        return this.contents
            .replace(/:vendor_name/g, 'spatie')
            .replace(/:package_name/g, repoName)
            .replace(/author@domain\.com/g, 'freek@spatie.be')
            .replace(/:author_homepage/g, 'https://spatie.be/open-source/support-us');
    }
}
