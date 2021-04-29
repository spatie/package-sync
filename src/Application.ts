/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */

import { existsSync, mkdirSync } from 'fs';
import { ComposerPackagesComparison } from './comparisons/ComposerPackagesComparison';
import { ComposerScriptsComparison } from './comparisons/ComposerScriptsComparison';
import { ExtraFilesComparison } from './comparisons/ExtraFilesComparison';
import { FileExistsComparison } from './comparisons/FileExistsComparison';
import { FileSizeComparison } from './comparisons/FileSizeComparison';
import { StringComparison } from './comparisons/StringComparison';
import { Configuration } from './Configuration';
import { FixerRepository } from './fixers/FixerRepository';
import { Repository, RepositoryKind } from './repositories/Repository';
import { RepositoryValidator } from './repositories/RepositoryValidator';

export class Application {
    public configuration: Configuration;

    constructor(configuration: Configuration | null = null) {
        this.configuration = configuration ?? new Configuration();

        this.ensureStoragePathsExist();
    }

    get config() {
        return this.configuration.conf;
    }

    public loadConfigFile(filename: string | null) {
        if (this.configuration.filename === filename || filename === null) {
            return this;
        }

        return this.useConfig(new Configuration(filename ?? this.configuration.filename));
    }

    public useConfig(configuration: Configuration) {
        this.configuration = configuration;

        return this;
    }

    public ensureStoragePathsExist() {
        if (!existsSync(this.configuration.conf.paths.templates)) {
            mkdirSync(this.configuration.conf.paths.templates, { recursive: true });
        }
        if (!existsSync(this.configuration.conf.paths.packages)) {
            mkdirSync(this.configuration.conf.paths.packages, { recursive: true });
        }
    }

    compareRepositories(skeleton: Repository, repo: Repository) {
        const comparisons = {
            // FileSizeComparison should be last to prioritize StringComparison
            files: [FileExistsComparison, StringComparison, FileSizeComparison],
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
    }

    analyzePackage(packageName: string) {
        const skeletonType = packageName.startsWith('laravel-') ? 'laravel' : 'php';
        const templateName = this.configuration.getFullTemplateName(skeletonType);

        const validator = new RepositoryValidator(this.configuration.conf.paths.packages, this.configuration.conf.paths.templates);

        validator.ensurePackageExists(packageName);
        validator.ensureTemplateExists(templateName);

        const skeleton = Repository.create(this.configuration.templatePath(templateName), RepositoryKind.SKELETON);
        const repo = Repository.create(this.configuration.packagePath(packageName), RepositoryKind.PACKAGE);

        return this.analyzeRepository(skeleton, repo);
    }

    analyzeRepository(skeleton: Repository, repo: Repository) {
        this.compareRepositories(skeleton, repo);

        repo.issues.forEach(issue => {
            FixerRepository.all()
                .forEach(fixer => {
                    if (fixer.fixes(issue.kind) && fixer.canFix(issue) && !this.configuration.shouldIgnoreIssue(issue)) {
                        issue.addFixer(new fixer(issue));
                    }
                });
        });

        return { skeleton, repo };
    }
}

export const app = new Application();
