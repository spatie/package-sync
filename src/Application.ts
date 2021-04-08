/* eslint-disable no-unused-vars */

import { existsSync, mkdirSync } from 'fs';
import { ComparisonKind } from './types/FileComparisonResult';
import { ComposerComparer } from './lib/composer/ComposerComparer';
import { config, Configuration } from './Configuration';
import { Repository, RepositoryKind } from './repositories/Repository';
import { RepositoryIssue } from './repositories/RepositoryIssue';
import { Comparisons } from './lib/comparisions/Comparisons';
import { RepositoryFile } from './repositories/RepositoryFile';
import { RepositoryValidator } from './repositories/RepositoryValidator';
import { FixerRepository } from './fixers/FixerRepository';
import { matches } from './lib/helpers';

export class Application {
    public configuration: Configuration;

    constructor(configuration: Configuration | null = null) {
        this.configuration = configuration ?? config;

        if (typeof config === 'undefined') {
            new Configuration();
        }

        this.ensureStoragePathsExist();
    }

    get config() {
        return this.configuration.conf;
    }

    public ensureStoragePathsExist() {
        if (!existsSync(config.conf.paths.templates)) {
            mkdirSync(config.conf.paths.templates, { recursive: true });
        }
        if (!existsSync(config.conf.paths.packages)) {
            mkdirSync(config.conf.paths.packages, { recursive: true });
        }
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
            .filter(file => !matches(file.relativeName, config.conf.ignoreNames))
            .filter(file => !config.conf.ignoreNames.includes(file.relativeName))
            .filter(file => !file.shouldIgnore)
            .filter(file => !skeleton.hasFile(file))
            .forEach(file => {
                const kind = file.isFile() ? ComparisonKind.FILE_NOT_IN_SKELETON : ComparisonKind.DIRECTORY_NOT_IN_SKELETON;

                repo.issues.push(new RepositoryIssue({ kind, score: 0 }, file.relativeName, null, file, skeleton, repo, false));
            });
    }

    analyzePackage(packageName: string) {
        const skeletonType = packageName.startsWith('laravel-') ? 'laravel' : 'php';
        const templateName = config.getFullTemplateName(skeletonType);

        const skeletonPath = config.templatePath(templateName);
        const repositoryPath = config.packagePath(packageName);
        const validator = new RepositoryValidator(config.conf.paths.packages, config.conf.paths.templates);

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
                    if (fixer.fixes(issue.kind) && fixer.canFix(issue) && !config.shouldIgnoreIssue(issue)) {
                        issue.addFixer(new fixer(issue));
                    }
                });
        });

        return { skeleton, repo };
    }
}

export const app = new Application();
