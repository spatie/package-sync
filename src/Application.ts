/* eslint-disable no-unused-vars */

import { existsSync, mkdirSync } from 'fs';
import { basename } from 'path';
import { Configuration } from './Configuration';
import { PackageIssue } from './issues/PackageIssue';
import { FileEntry, FileEntryArray } from './lib/FileEntry';
import { compareFileSizes } from './lib/FileSizeComparison';
import { fileSize, getFileList, isDirectory } from './lib/helpers';
import { ComparisonScoreRequirements } from './types/ComparisonScoreRequirements';
import { ComparisonKind, FileComparisonResult } from './types/FileComparisonResult';
import { FileScoreRequirements } from './types/FileScoreRequirements';
import { ComposerComparer } from './lib/composer/ComposerComparer';
import { ConsolePrinter } from './printers/ConsolePrinter';
import { File } from './lib/File';
import { Repository } from './lib/Repository';

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

    public getFiles(directory: string, basePath: string | null = null, filter: any | null = null): FileEntryArray {
        const result: FileEntry[] = [];
        const filterFunc = filter ?? (() => true);

        getFileList(directory, basePath, true)
            .filter(fn => !this.shouldIgnoreFile(fn.replace(`${basePath}/`, '')))
            .forEach(fqName => {
                const relativeName = basePath ? fqName.replace(`${basePath}/`, '') : fqName;
                const isPath = isDirectory(fqName);

                if (!result.find(item => item.relativeName === relativeName)) {
                    result.push({
                        isFile: !isPath,
                        name: fqName,
                        relativeName: relativeName,
                        filesize: fileSize(fqName),
                        shouldIgnore: this.shouldIgnoreFile(relativeName),
                        shouldCompare: !isPath && this.shouldCompareFile(fqName),
                        requiredScores: this.getFileScoreRequirements(fqName),
                    });

                    if (isPath) {
                        result.push(...this.getFiles(fqName, basePath ?? directory));
                    }
                }
            });

        return new FileEntryArray(result.filter(filterFunc));
    }

    protected performComparisons(skeletonPath: string, repositoryPath: string, repositoryFiles: any, filesDiff: any, fileinfo: any) {
        if (!fileinfo.isFile || !fileinfo.shouldCompare) {
            return;
        }

        const repoFile = repositoryFiles.findByRelativeName(fileinfo.relativeName);
        const repoFileData = File.contents(repoFile?.name);
        const skeletonFileData = File.read(fileinfo.name)
            .processTemplate(basename(repositoryPath));

        const similarityScore = compareTwoStrings(skeletonFileData, repoFileData);

        //console.log(`similarityScore for '${fileinfo.relativeName}' = ${similarityScore}`);

        const sizeComparison = compareFileSizes(fileinfo.filesize, repoFile?.filesize ?? 0);

        if (sizeComparison.differByPercentage(fileinfo.requiredScores.size)) {
            filesDiff.push({
                kind: ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED,
                score: sizeComparison.percentDifferenceForDisplay(8, 5),
                fileinfo,
                skeletonPath,
                repositoryPath,
            });
            return;
        }

        if (similarityScore < fileinfo.requiredScores.similar) {
            const kind =
                fileinfo.requiredScores.similar === 1.0 ? ComparisonKind.FILE_DOES_NOT_MATCH : ComparisonKind.FILE_NOT_SIMILAR_ENOUGH;

            filesDiff.push({ kind: kind, score: similarityScore.toFixed(5)
                .padStart(8), fileinfo, skeletonPath, repositoryPath });
            return;
        }
    }

    protected compareRepositoryToSkeleton(
        skeletonPath: string,
        repositoryPath: string,
        repositoryFiles: any,
        skeletonFiles: any,
        filesDiff: any,
    ) {
        repositoryFiles
            .filter((fi: any) => fi.shouldCompare || !fi.shouldIgnore)
            .filter((fi: any) => !skeletonFiles.containsEntry(fi))
            .forEach((fileinfo: any) => {
                const kind = fileinfo.isFile ? ComparisonKind.FILE_NOT_IN_SKELETON : ComparisonKind.DIRECTORY_NOT_IN_SKELETON;

                filesDiff.push({ kind, score: 0, fileinfo, skeletonPath, repositoryPath });
            });
    }

    compareRepositories(skeleton: Repository, repo: Repository) {
        const filesDiff: any = [];

        skeleton.files.forEach(f => {
            if (!f.shouldIgnore && !repo.files.find(rf => rf.relativeName === f.relativeName)) {
                const kind = f.isFile() ? ComparisonKind.FILE_NOT_FOUND : ComparisonKind.DIRECTORY_NOT_FOUND;
                const compareResult = { kind: kind, score: 0, file: f, skeleton, repository: repo };
                ///new PackageIssue(compareResult, skeleton.path, repo.path)
                return;
            }

            console.log(`compare file ${f.relativeName}`);
            //this.performComparisons(skeletonPath, repositoryPath, repositoryFiles, filesDiff, fileinfo);
        });

        console.log(filesDiff);

        // this.compareRepositoryToSkeleton(skeletonPath, repositoryPath, repositoryFiles, skeletonFiles, filesDiff);

        // const packagesDiff = ComposerComparer.comparePackages(skeletonPath, repositoryPath);
        // const scriptsDiff = ComposerComparer.compareScripts(skeletonPath, repositoryPath);

        // return this.sortDiffResultsForOutput(filesDiff, [...packagesDiff, ...scriptsDiff]);
    }

    compareDotFiles(skeletonPath: string, repositoryPath: string) {
        this.init(skeletonPath, repositoryPath);
        const skeletonFiles = this.getFiles(skeletonPath, skeletonPath);
        const repositoryFiles = this.getFiles(repositoryPath, repositoryPath);

        const filesDiff: any = [];

        skeletonFiles.forEach(fileinfo => {
            if (!fileinfo.shouldIgnore && !repositoryFiles.containsEntry(fileinfo)) {
                const kind = fileinfo.isFile ? ComparisonKind.FILE_NOT_FOUND : ComparisonKind.DIRECTORY_NOT_FOUND;
                filesDiff.push({ kind: kind, score: 0, fileinfo, skeletonPath, repositoryPath });
                return;
            }

            this.performComparisons(skeletonPath, repositoryPath, repositoryFiles, filesDiff, fileinfo);
        });

        this.compareRepositoryToSkeleton(skeletonPath, repositoryPath, repositoryFiles, skeletonFiles, filesDiff);

        const packagesDiff = ComposerComparer.comparePackages(skeletonPath, repositoryPath);
        const scriptsDiff = ComposerComparer.compareScripts(skeletonPath, repositoryPath);

        return this.sortDiffResultsForOutput(filesDiff, [...packagesDiff, ...scriptsDiff]);
    }

    protected sortDiffResultsForOutput(filesDiff: any[], additionalDiffs: any[]): FileComparisonResult[] {
        const firstSegment = (s: string, sep = '_') => s.split(sep)
            .shift();

        return filesDiff
            .sort((a: any, b: any) => {
                return (firstSegment(a.kind) + a.fileinfo.relativeName).localeCompare(firstSegment(b.kind) + b.fileinfo.relativeName);
            })
            .map((fi: any) => ({
                kind: fi.kind,
                score: fi.score,
                name: fi.fileinfo.relativeName,
                skeletonPath: fi.skeletonPath,
                repositoryPath: fi.repositoryPath,
            }))
            .concat(...additionalDiffs)
            .sort((a: any, b: any) => (firstSegment(a.kind) + a.name).localeCompare(firstSegment(b.kind) + b.name))
            .sort((a: any, b: any) => {
                if (
                    a.kind !== b.kind &&
                    (a.kind === ComparisonKind.PACKAGE_NOT_USED ||
                        a.kind === ComparisonKind.PACKAGE_VERSION_MISMATCH ||
                        a.kind === ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND)
                ) {
                    return -1;
                }

                return a.kind === b.kind ? 0 : 1;
            })
            .sort((a: any) => (firstSegment(a.kind) === 'extra' ? -1 : 0));
    }

    public fileComparisonResultsToIssues(results: FileComparisonResult[]): PackageIssue[] {
        return results.map(r => new PackageIssue(r, r.skeletonPath, r.repositoryPath, false));
    }

    public displayResults(skeletonPath: string, repositoryPath: string, results: FileComparisonResult[]): void {
        const issues = results
            .map(r => new PackageIssue(r, skeletonPath, repositoryPath, false))
            .filter(issue => !issue.resolved)
            .filter(issue => !this.configuration.isIssueIgnored(issue));

        new ConsolePrinter()
            .printResults(skeletonPath, repositoryPath, issues);
    }
}

export const app = new Application(process.cwd());
