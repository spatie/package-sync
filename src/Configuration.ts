import { readFileSync } from 'fs';
import { ComparisonKind } from './types/FileComparisonResult';
import { ScoreRequirements } from './types/ScoreRequirements';
import { sep, basename } from 'path';
import { ComparisonScoreRequirements } from './types/ComparisonScoreRequirements';
import { existsSync } from 'fs';

const yaml = require('js-yaml');
const micromatch = require('micromatch');

export enum PackageSyncAction {
    FIX = 'fix', // eslint-disable-line no-unused-vars
    ANALYZE = 'analyze', // eslint-disable-line no-unused-vars
}

export interface ConfigurationRecord {
    paths: {
        templates: string;
        packages: string;
    };

    fixers: {
        disabled?: string[];
        OptionalPackages: string[];
    };

    git: {
        branches: {
            default: string;
            format: string;
            createOn: Set<PackageSyncAction>;
        };
    };

    scoreRequirements: ScoreRequirements;
    ignoreNames: Array<string>;
    skipComparisons: Array<string>;

    templates: {
        vendor: string;
        names: string[];
    };

    packages: {
        vendor: string;
        email: string;
        homepage: string;
    };

    issues: {
        ignored: {
            [ComparisonKind.DIRECTORY_NOT_FOUND]?: string[];
            [ComparisonKind.DIRECTORY_NOT_IN_SKELETON]?: string[];
            [ComparisonKind.FILE_DOES_NOT_MATCH]?: string[];
            [ComparisonKind.FILE_NOT_IN_SKELETON]?: string[];
            [ComparisonKind.FILE_NOT_SIMILAR_ENOUGH]?: string[];
            [ComparisonKind.PACKAGE_NOT_USED]?: string[];
            [ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND]?: string[];
            [ComparisonKind.PACKAGE_VERSION_MISMATCH]?: string[];
        };
    };
}

const defaultConfig = {
    fixers: {
        disabled: [],
    },
    scoreRequirements: {
        defaults: {
            similar: 0.5,
            size: 20,
        },
        files: [],
    },
    ignoreNames: [],
    skipComparisons: [],
    paths: {
        templates: `${__dirname}/templates`,
        packages: `${__dirname}/packages`,
    },
    templates: {
        vendor: 'spatie',
        names: ['package-skeleton-php', 'package-skeleton-laravel'],
    },
    issues: {
        ignored: {
            [ComparisonKind.DIRECTORY_NOT_FOUND]: [],
            [ComparisonKind.DIRECTORY_NOT_IN_SKELETON]: [],
            [ComparisonKind.FILE_DOES_NOT_MATCH]: [],
            [ComparisonKind.FILE_NOT_IN_SKELETON]: [],
            [ComparisonKind.FILE_NOT_SIMILAR_ENOUGH]: [],
            [ComparisonKind.PACKAGE_NOT_USED]: [],
            [ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND]: [],
            [ComparisonKind.PACKAGE_VERSION_MISMATCH]: [],
        },
    },
};

export class Configuration {
    public conf: ConfigurationRecord;
    public filename: string;

    constructor(filename: string | null = null) {
        if (filename === null) {
            filename = __filename.replace(/\.[tj]s$/, '.yml');

            if (process.env.NODE_ENV === 'test') {
                filename = process.cwd() + '/tests/data/index.yml';
            }
        }

        this.filename = filename;
        this.conf = this.loadConfigurationFile(this.filename).config;
    }

    public loadConfigurationFile(filename: string) {
        if (!existsSync(filename)) {
            return { config: defaultConfig };
        }

        const content = readFileSync(filename, { encoding: 'utf-8' })
            .replace(/\{\{__dirname\}\}/g, __dirname);

        return yaml.load(content);
    }

    public qualifiedTemplateName(templateName: string): string {
        return `${this.conf.templates.vendor}/${templateName}`;
    }

    public qualifiedPackageName(name: string): string {
        if (name.includes('/') && name.length > 2) {
            return name;
        }
        return `${this.conf.packages.vendor}/${name}`;
    }

    public getFullTemplateName(shortName: string): string {
        const shortTemplateName = (longName: string) => {
            return longName.split('-')
                .pop() ?? longName;
        };

        return this.conf.templates.names.find(name => shortTemplateName(name) === shortName) ?? shortName;
    }

    // public isIssueIgnored(issue: PackageIssue): boolean {
    //     return this.conf.issues.ignored[issue.result.kind.toString()]?.includes(issue.result.name) ?? false;
    // }

    public templatePath(templateName: string): string {
        return `${this.conf.paths.templates}/${templateName}`;
    }

    public packagePath(packageName: string): string {
        return `${this.conf.paths.packages}/${packageName}`;
    }

    public shouldIgnoreFile(fn: string): boolean {
        return (
            micromatch.isMatch(fn, config.conf.ignoreNames) ||
            micromatch.isMatch(fn.replace(process.cwd() + sep, ''), config.conf.ignoreNames)
        );
    }

    public shouldIgnoreIssue(issue: any): boolean {
        if (typeof config.conf.issues.ignored[issue.kind] !== 'undefined') {
            return micromatch.isMatch(issue.name, config.conf.issues.ignored[issue.kind]);
        }

        return false;
    }

    public shouldCompareFile(fn: string): boolean {
        return !config.conf.skipComparisons.includes(basename(fn));
    }

    public getSimilarScoreRequirement(fn: string): number {
        const reqs = config.conf.scoreRequirements;

        return reqs.files.find(req => req.name === basename(fn))?.scores?.similar ?? reqs.defaults.similar;
    }

    public getMaxAllowedSizeDifferenceScore(fn: string): number {
        const reqs = config.conf.scoreRequirements;

        return reqs.files.find(req => req.name === basename(fn))?.scores?.size ?? reqs.defaults.size;
    }

    public getFileScoreRequirements(fn: string): ComparisonScoreRequirements {
        return {
            similar: this.getSimilarScoreRequirement(fn),
            size: this.getMaxAllowedSizeDifferenceScore(fn),
        };
    }
}

export const config = new Configuration();
