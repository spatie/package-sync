/* eslint-disable no-unused-vars */

import { basename } from 'path';
import { app } from '../Application';
import { PackageIssue } from '../issues/PackageIssue';
import { Composer } from './composer/Composer';
import { FileEntry, FileEntryArray } from './FileEntry';
import { fileSize, getFileList, isDirectory } from './helpers';

export enum RepositoryKind {
    SKELETON = 'skeleton',
    PACKAGE = 'package',
}

export class Repository {
    protected composerData: Composer;
    protected loadedFiles = false;
    protected fileList: any[] = [];
    public issues: PackageIssue[] = [];

    constructor(public path: string, public kind: RepositoryKind) {
        this.composerData = Composer.createFromPath(path);
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

    hasIssues() {
        return this.issues.length > 0;
    }

    isSkeleton() {
        return this.kind === RepositoryKind.SKELETON;
    }

    isPackage() {
        return this.kind === RepositoryKind.PACKAGE;
    }

    protected getFileList(directory: string, basePath: string | null = null): FileEntryArray {
        const result: FileEntry[] = [];

        getFileList(directory, basePath, true)
            .filter(fn => !app.shouldIgnoreFile(fn.replace(`${basePath}/`, '')))
            .forEach(fqName => {
                const relativeName = basePath ? fqName.replace(`${basePath}/`, '') : fqName;
                const isPath = isDirectory(fqName);

                if (!result.find(item => item.relativeName === relativeName)) {
                    result.push({
                        isFile: !isPath,
                        name: fqName,
                        relativeName: relativeName,
                        filesize: fileSize(fqName),
                        shouldIgnore: app.shouldIgnoreFile(relativeName),
                        shouldCompare: !isPath && app.shouldCompareFile(fqName),
                        requiredScores: app.getFileScoreRequirements(fqName),
                    });

                    if (isPath) {
                        result.push(...this.getFileList(fqName, basePath ?? directory));
                    }
                }
            });

        return new FileEntryArray(result);
    }

    public loadFiles() {
        this.fileList = this.getFileList(this.path, this.path);
        this.loadedFiles = true;

        return this;
    }
}
