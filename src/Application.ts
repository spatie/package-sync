/* eslint-disable no-unused-vars */

import { existsSync, mkdirSync } from 'fs';
import { sep } from 'path';
import { ComparisonKind } from './types/FileComparisonResult';
import { ComposerComparer } from './lib/composer/ComposerComparer';
import { config, Configuration } from './Configuration';
import { Repository, RepositoryKind } from './lib/Repository';
import { RepositoryIssue } from './issues/RepositoryIssue';
import { Comparisons } from './lib/comparisions/Comparisons';
import { RepositoryFile } from './lib/RepositoryFile';
import { RepositoryValidator } from './lib/RepositoryValidator';
import { FixerRepository } from './issues/FixerRepository';

const micromatch = require('micromatch');

export class Application {
    public configuration: Configuration;
    public basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
        this.configuration = config;

        this.ensureStoragePathsExist();
    }

    get config() {
        return this.configuration.conf;
    }

    public ensureStoragePathsExist() {
        if (!existsSync(this.config.paths.templates)) {
            mkdirSync(this.config.paths.templates, { recursive: true });
        }
        if (!existsSync(this.config.paths.packages)) {
            mkdirSync(this.config.paths.packages, { recursive: true });
        }
    }

    public shouldIgnoreFile(fn: string): boolean {
        return (
            micromatch.isMatch(fn, this.config.ignoreNames) || // || micromatch.contains(fn, this.config.ignoreNames);
            micromatch.isMatch(fn.replace(process.cwd() + sep, ''), this.config.ignoreNames)
        );
    }

    public shouldIgnoreIssue(issue: RepositoryIssue): boolean {
        if (typeof this.config.issues.ignored[issue.kind] !== 'undefined') {
            return micromatch.isMatch(issue.name, this.config.issues.ignored[issue.kind]);
        }

        return false;
    }

    performStringComparison(skeleton: Repository, repo: Repository, file: RepositoryFile, repoFile: RepositoryFile | null) {
        const strComparison = Comparisons.strings(file?.processTemplate(), repoFile?.contents);

        if (!strComparison.meetsRequirement(file.requiredScores.similar)) {
            const compareResult = {
                kind: ComparisonKind.FILE_NOT_SIMILAR_ENOUGH,
                score: strComparison.similarityScore,
            };

            repo.issues.push(new RepositoryIssue(compareResult, file.relativeName, file, repoFile, skeleton, repo, false));

            return true;
        }

        return false;
    }

    performSizeComparison(skeleton: Repository, repo: Repository, file: RepositoryFile, repoFile: RepositoryFile | null) {
        const sizeComparison = Comparisons.filesizes(file.sizeOnDisk, repoFile?.sizeOnDisk);

        if (sizeComparison.meetsRequirement(file.requiredScores.size)) {
            const result = {
                kind: ComparisonKind.ALLOWED_SIZE_DIFFERENCE_EXCEEDED,
                score: sizeComparison.format(2),
            };

            repo.issues.push(new RepositoryIssue(result, file.relativeName, file, repoFile, skeleton, repo, false));

            return true;
        }

        return false;
    }

    performFileExistsComparison(skeleton: Repository, repo: Repository, file: RepositoryFile) {
        if (!file.shouldIgnore && !repo.hasFile(file)) {
            const kind = file.isFile() ? ComparisonKind.FILE_NOT_FOUND : ComparisonKind.DIRECTORY_NOT_FOUND;

            repo.issues.push(new RepositoryIssue({ kind, score: 0 }, file.relativeName, file, null, skeleton, repo, false));

            return true;
        }

        return false;
    }

    compareRepositories(skeleton: Repository, repo: Repository) {
        skeleton.files.forEach(file => {
            const repoFile = repo.getFile(file.relativeName);

            if (this.performFileExistsComparison(skeleton, repo, file)) {
                return;
            }

            if (this.performStringComparison(skeleton, repo, file, repoFile)) {
                return;
            }

            if (this.performSizeComparison(skeleton, repo, file, repoFile)) {
                return;
            }
        });

        this.checkRepoForFilesNotInSkeleton(repo, skeleton);

        ComposerComparer.comparePackages(skeleton.path, repo.path)
            .forEach(r =>
                repo.issues.push(new RepositoryIssue(r, r.name, null, null, skeleton, repo, false)),
            );

        ComposerComparer.compareScripts(skeleton.path, repo.path)
            .forEach(r =>
                repo.issues.push(new RepositoryIssue(r, r.name, null, null, skeleton, repo, false)),
            );
    }

    checkRepoForFilesNotInSkeleton(repo: Repository, skeleton: Repository) {
        repo.files
            .filter(file => !file.shouldIgnore)
            .filter(file => !skeleton.hasFile(file))
            .forEach(file => {
                const kind = file.isFile() ? ComparisonKind.FILE_NOT_IN_SKELETON : ComparisonKind.DIRECTORY_NOT_IN_SKELETON;

                repo.issues.push(new RepositoryIssue({ kind, score: 0 }, file.relativeName, null, file, skeleton, repo, false));
            });
    }

    analyzePackage(packageName: string) {
        const skeletonType = packageName.startsWith('laravel-') ? 'laravel' : 'php';
        const templateName = this.configuration.getFullTemplateName(skeletonType);

        const skeletonPath = config.templatePath(templateName);
        const repositoryPath = config.packagePath(packageName);
        const validator = new RepositoryValidator(app.config.paths.packages, app.config.paths.templates);

        validator.ensurePackageExists(packageName);
        validator.ensureTemplateExists(templateName);

        const skeleton = Repository.create(skeletonPath, RepositoryKind.SKELETON);
        const repo = Repository.create(repositoryPath, RepositoryKind.PACKAGE);

        return this.analyzeRepository(skeleton, repo);
    }

    analyzeRepository(skeleton: Repository, repo: Repository) {
        this.compareRepositories(skeleton, repo);

        repo.issues.forEach(issue => {
            FixerRepository.all()
                .forEach(fixer => {
                    if (fixer.fixes(issue.kind) && fixer.canFix(issue) && !this.shouldIgnoreIssue(issue)) {
                        issue.addFixer(new fixer(issue));
                    }
                });
        });

        return { skeleton, repo };
    }
}

export const app = new Application(process.cwd());
