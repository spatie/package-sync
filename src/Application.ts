/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */

import { existsSync, mkdirSync } from 'fs';
import { ComparisonKind } from './types/FileComparisonResult';
import { ComposerComparer } from './lib/composer/ComposerComparer';
import { config, Configuration } from './Configuration';
import { Repository, RepositoryKind } from './repositories/Repository';
import { RepositoryIssue } from './repositories/RepositoryIssue';
import { RepositoryValidator } from './repositories/RepositoryValidator';
import { FixerRepository } from './fixers/FixerRepository';
import { matches } from './lib/helpers';
import { FileExistsComparison } from './comparisons/FileExistsComparison';
import { StringComparison } from './comparisons/StringComparison';
import { FileSizeComparison } from './comparisons/FileSizeComparison';
import { ExtraFilesComparison } from './comparisons/ExtraFilesComparison';
import { ComposerScriptsComparison } from './comparisons/ComposerScriptsComparison';
import { ComposerPackagesComparison } from './comparisons/ComposerPackagesComparison';
import { Comparison } from './comparisons/Comparison';

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

    public loadConfigFile(filename: string) {
        if (this.configuration.filename === filename) {
            return this;
        }

        return this.useConfig(new Configuration(filename || config.filename));
    }

    public useConfig(configuration: Configuration) {
        this.configuration = configuration;

        return this;
    }

    public ensureStoragePathsExist() {
        if (!existsSync(config.conf.paths.templates)) {
            mkdirSync(config.conf.paths.templates, { recursive: true });
        }
        if (!existsSync(config.conf.paths.packages)) {
            mkdirSync(config.conf.paths.packages, { recursive: true });
        }
    }

    compareRepositories(skeleton: Repository, repo: Repository) {
        const comparisons = {
            files: [
                FileExistsComparison,
                StringComparison,
                FileSizeComparison, //should come last to prioritize StringComparison
            ],
            other: [ExtraFilesComparison, ComposerScriptsComparison, ComposerPackagesComparison],
        };

        skeleton.files.forEach(file => {
            const repoFile = repo.getFile(file.relativeName);

            for (const comparisonClass of comparisons.files) {
                const comparison = comparisonClass.create(skeleton, repo, file, repoFile);

                comparison.compare(null);

                if (!comparison.passed()) {
                    return;
                }
            }
        });

        comparisons.other.forEach((comparisonClass: any) => {
            comparisonClass.create(skeleton, repo, null, null)
                .compare(null);
        });

        // ComposerComparer.comparePackages(skeleton.path, repo.path)
        //     .forEach(r =>
        //         repo.issues.push(new RepositoryIssue(r, r.name, null, null, skeleton, repo, false)),
        //     );
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
