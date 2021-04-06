/* eslint-disable no-unused-vars */

import { existsSync, mkdirSync } from 'fs';
import { basename } from 'path';
import { ComparisonKind } from './types/FileComparisonResult';
import { ComparisonScoreRequirements } from './types/ComparisonScoreRequirements';
import { ComposerComparer } from './lib/composer/ComposerComparer';
import { Configuration } from './Configuration';
import { FileScoreRequirements } from './types/FileScoreRequirements';
import { Repository } from './lib/Repository';
import { RepositoryIssue } from './issues/RepositoryIssue';
import { compareFileSizes } from './lib/FileSizeComparison';

const { compareTwoStrings } = require('string-similarity');
const micromatch = require('micromatch');

export class Application {
    public configuration: Configuration;
    public basePath: string;

    public skeletonPath = '';
    public repositoryPath = '';

    get repositoryName() {
        return basename(this.repositoryPath);
    }

    constructor(basePath: string) {
        this.basePath = basePath;
        this.configuration = new Configuration();

        this.ensureStoragePathsExist();
    }

    get config() {
        return this.configuration.conf;
    }

    public init(skeletonPath: string, repositoryPath: string) {
        this.skeletonPath = skeletonPath;
        this.repositoryPath = repositoryPath;
    }

    public ensureStoragePathsExist() {
        if (!existsSync(this.config.templatesPath)) {
            mkdirSync(this.config.templatesPath, { recursive: true });
        }
        if (!existsSync(this.config.packagesPath)) {
            mkdirSync(this.config.packagesPath, { recursive: true });
        }
    }

    public templatePath(templateName: string): string {
        return `${this.config.templatesPath}/${templateName}`;
    }

    public packagePath(packageName: string): string {
        return `${this.config.packagesPath}/${packageName}`;
    }

    public shouldIgnoreFile(fn: string): boolean {
        return micromatch.contains(fn, this.config.ignoreNames);
    }

    public shouldCompareFile(fn: string): boolean {
        return !this.config.skipComparisons.includes(basename(fn));
    }

    public getSimilarScoreRequirement(fn: string): number {
        const reqs = this.config.scoreRequirements;

        return reqs.files.find((req: FileScoreRequirements) => req.name === basename(fn))?.scores?.similar ?? reqs.defaults.similar;
    }

    public getMaxAllowedSizeDifferenceScore(fn: string): number {
        const reqs = this.config.scoreRequirements;

        return reqs.files.find((req: FileScoreRequirements) => req.name === basename(fn))?.scores?.size ?? reqs.defaults.size;
    }

    public getFileScoreRequirements(fn: string): ComparisonScoreRequirements {
        return {
            similar: this.getSimilarScoreRequirement(fn),
            size: this.getMaxAllowedSizeDifferenceScore(fn),
        };
    }

    compareRepositories(skeleton: Repository, repo: Repository) {
        skeleton.files.forEach(file => {
            if (!file.shouldIgnore && !repo.hasFile(file)) {
                const kind = file.isFile() ? ComparisonKind.FILE_NOT_FOUND : ComparisonKind.DIRECTORY_NOT_FOUND;

                repo.issues.push(new RepositoryIssue({ kind, score: 0 }, file.relativeName, file, null, skeleton, repo, false));

                return;
            }

            const repoFile = repo.getFile(file.relativeName);
            const similarityScore = compareTwoStrings(file?.processTemplate() ?? '', repoFile?.contents ?? '');

            if (similarityScore < file.requiredScores.similar) {
                const compareResult = {
                    kind: ComparisonKind.FILE_NOT_SIMILAR_ENOUGH,
                    score: similarityScore,
                };

                repo.issues.push(new RepositoryIssue(compareResult, file.relativeName, file, repoFile, skeleton, repo, false));

                return;
            }

            const sizeComparison = compareFileSizes(file.sizeOnDisk, repoFile?.sizeOnDisk ?? 0);

            if (sizeComparison.differByPercentage(file.requiredScores.size)) {
                const result = {
                    kind: ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED,
                    score: sizeComparison.percentDifferenceForDisplay(8, 5),
                };

                repo.issues.push(new RepositoryIssue(result, file.relativeName, file, repoFile, skeleton, repo, false));

                return;
            }
        });

        repo.files
            .filter(file => !file.shouldIgnore)
            .filter(file => !skeleton.hasFile(file))
            .forEach(file => {
                const kind = file.isFile() ? ComparisonKind.FILE_NOT_IN_SKELETON : ComparisonKind.DIRECTORY_NOT_IN_SKELETON;

                repo.issues.push(new RepositoryIssue({ kind, score: 0 }, file.relativeName, null, file, skeleton, repo, false));
            });

        ComposerComparer.comparePackages(skeleton.path, repo.path)
            .forEach(r =>
                repo.issues.push(new RepositoryIssue(r, r.name, null, null, skeleton, repo, false)),
            );

        ComposerComparer.compareScripts(skeleton.path, repo.path)
            .forEach(r =>
                repo.issues.push(new RepositoryIssue(r, r.name, null, null, skeleton, repo, false)),
            );
    }
}

export const app = new Application(process.cwd());
