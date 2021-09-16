/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { RepositoryFile } from '../repositories/RepositoryFile';
import { ComparisonKind } from '../types/FileComparisonResult';
import { Comparison } from './Comparison';
import { matches } from '../lib/helpers';
import { config } from '../Configuration';

export class ExtraFilesComparison extends Comparison {
    protected kind: ComparisonKind = ComparisonKind.FILE_NOT_FOUND;
    protected extraFiles: RepositoryFile[] = [];

    public compare(requiredScore: number | null): Comparison {
        this.score = 0;

        this.extraFiles = this.repo.files
            .filter(file => !matches(file.relativeName, config.conf.ignoreNames))
            .filter(file => !config.conf.ignoreNames.includes(file.relativeName))
            .filter(file => !file.shouldIgnore)
            .filter(file => !this.skeleton.hasFile(file));

        this.comparisonPassed = this.extraFiles.length === 0;

        if (!this.comparisonPassed) {
            this.extraFiles.forEach(file => {
                this.file = file;
                this.createIssue(null);
            });
        }

        return this;
    }

    public getKind(): ComparisonKind {
        return this.file?.isFile() ?? true ? ComparisonKind.FILE_NOT_IN_SKELETON : ComparisonKind.DIRECTORY_NOT_IN_SKELETON;
    }

    public meetsRequirement(percentage): boolean {
        return this.extraFiles.length === 0;
    }
}
