/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { basename } from 'path';
import { config } from '../Configuration';
import { RepositoryIssue } from './RepositoryIssue';
import { Composer } from '../lib/composer/Composer';
import { getFileList } from '../lib/helpers';
import { RepositoryFile } from './RepositoryFile';

export enum RepositoryKind {
    SKELETON = 'skeleton',
    PACKAGE = 'package',
}

export class Repository {
    public composerData: Composer;
    protected loadedFiles = false;
    public fileList: RepositoryFile[] = [];
    public issues: RepositoryIssue[] = [];

    constructor(public path: string, public kind: RepositoryKind) {
        this.composerData = Composer.createFromPath(path);
    }

    static create(path: string, kind: RepositoryKind) {
        return new Repository(path, kind);
    }

    get name() {
        return basename(this.path);
    }

    get composer() {
        return this.composerData;
    }

    get packages() {
        return this.composer.packages('all');
    }

    get files() {
        if (!this.loadedFiles) {
            this.loadFiles();
        }

        return this.fileList;
    }

    getFile(relativeName: string): RepositoryFile | null {
        return this.files.find(f => f.relativeName === relativeName) || null;
    }

    hasFile(file: RepositoryFile): boolean {
        return this.files.find(f => f.relativeName === file.relativeName) !== undefined;
    }

    protected getFileList(directory: string, basePath: string | null = null): RepositoryFile[] {
        const result: RepositoryFile[] = [];

        getFileList(directory, basePath, true)
            .filter(fn => !config.shouldIgnoreFile(fn.replace(`${basePath}/`, '')))
            .forEach(fqName => {
                const rfile = new RepositoryFile(this, fqName);
                const relativeName = basePath ? fqName.replace(`${basePath}/`, '') : fqName;

                if (!result.find(item => item.relativeName === relativeName)) {
                    result.push(
                        rfile.withOptions(
                            config.shouldIgnoreFile(relativeName),
                            rfile.isFile() && config.shouldCompareFile(fqName),
                            config.getFileScoreRequirements(fqName),
                        ),
                    );

                    if (rfile.isDirectory()) {
                        result.push(...this.getFileList(fqName, basePath ?? directory));
                    }
                }
            });

        return result;
    }

    public loadFiles() {
        this.fileList = this.getFileList(this.path, this.path);
        this.loadedFiles = true;

        return this;
    }
}
