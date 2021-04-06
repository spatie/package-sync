import { readFileSync } from 'fs';
import { ComparisonKind } from './types/FileComparisonResult';
import { PackageIssue } from './issues/PackageIssue';
import { ScoreRequirements } from './types/ScoreRequirements';

const yaml = require('js-yaml');

export interface ConfigurationRecord {
    fixers: {
        disabled?: string[];
        OptionalPackages: string[];
    };

    scoreRequirements: ScoreRequirements;
    ignoreNames: Array<string>;
    skipComparisons: Array<string>;
    templatesPath: string;
    packagesPath: string;
    templates: {
        vendor: string;
        names: string[];
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

export class Configuration {
    public conf: ConfigurationRecord;

    constructor() {
        // this.conf = {
        //     templates: {
        //         vendor: 'spatie',
        //         names: ['package-skeleton-php', 'package-skeleton-laravel'],
        //     },
        //     templatesPath: `${__dirname}/temp`,
        //     packagesPath: `/development/repositories/spatie`,
        //     scoreRequirements: {
        //         defaults: {
        //             similar: 0.79,
        //             size: 10,
        //         },
        //         files: [
        //             { name: 'CONTRIBUTING.md', scores: { similar: 0.99, size: 5 } },
        //             { name: '.editorconfig', scores: { similar: 1.0, size: 5 } },
        //             { name: '.gitattributes', scores: { similar: 0.9, size: 8 } },
        //             { name: '.gitignore', scores: { similar: 0.9, size: 8 } },
        //             { name: '.php_cs.dist', scores: { similar: 1.0, size: 5 } },
        //         ],
        //     },
        //     skipComparisons: ['composer.json'],
        //     ignoreNames: [
        //         '.git/*',
        //         '.idea/*',
        //         '.idea',
        //         '.vscode/*',
        //         'CHANGELOG.md',
        //         'README.md',
        //         'art/*',
        //         'build/*',
        //         'build',
        //         'composer.lock',
        //         //'config',
        //         'coverage',
        //         'database',
        //         'docs/*',
        //         'node_modules/*',
        //         'package-lock.json',
        //         'resources/*',
        //         'resources',
        //         'src/*',
        //         'src',
        //         'stubs/*',
        //         'tests/*',
        //         'vendor/*',
        //         '*.sh',
        //         '*.cache',
        //         '*.lock',
        //     ],
        // };

        if (process.env.NODE_ENV === 'test') {
            this.conf = this.loadConfigurationFile(process.cwd() + '/tests/data/index.yml').config;
            return;
        }

        this.conf = this.loadConfigurationFile(__filename.replace(/\.[tj]s$/, '.yml')).config;
    }

    public loadConfigurationFile(filename: string) {
        const content = readFileSync(filename, { encoding: 'utf-8' })
            .replace(/\{\{__dirname\}\}/g, __dirname);

        return yaml.load(content);
    }

    public qualifiedTemplateName(templateName: string): string {
        return `${this.conf.templates.vendor}/${templateName}`;
    }

    public qualifiedPackageName(name: string): string {
        return `${this.conf.templates.vendor}/${name}`;
    }

    public getFullTemplateName(shortName: string): string {
        const shortTemplateName = (longName: string) => {
            return longName.split('-')
                .pop() ?? longName;
        };

        return this.conf.templates.names.find(name => shortTemplateName(name) === shortName) ?? shortName;
    }

    public isIssueIgnored(issue: PackageIssue): boolean {
        return this.conf.issues.ignored[issue.result.kind.toString()]?.includes(issue.result.name) ?? false;
    }
}

export const config = new Configuration();
