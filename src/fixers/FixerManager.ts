/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */

import { config, ConfigurationRecord } from '../Configuration';
import { matches, uniqueArray } from '../lib/helpers';
import { Fixer } from './Fixer';
import { FixerRepository } from './FixerRepository';
import { RepositoryIssue } from '../repositories/RepositoryIssue';

export class FixerManager {
    public config: ConfigurationRecord;

    constructor(conf: ConfigurationRecord | null = null) {
        this.config = <ConfigurationRecord>(conf ?? config);
    }

    static create(config: ConfigurationRecord | null = null) {
        return new FixerManager(config);
    }

    public isFixerDisabled(fixer: any): boolean {
        // const name = Object.getOwnPropertyDescriptor(fixer, 'name')?.value ?? '';
        // const shortName = name.replace(/Fixer$/, '');
        const disabledFixers = this.config.fixers?.disabled ?? [];

        return matches(fixer.prettyName(), disabledFixers);
    }

    public static getFixerClass(name: string): any | null {
        const result = FixerRepository.all()
            .find(fixer => fixer.prettyName() === name);

        if (result === undefined) {
            return null;
        }

        return result;
    }

    public getFixerForIssue(name: string, issue: RepositoryIssue): Fixer | null {
        const fixerClass = FixerRepository.all()
            .find(fixer => fixer.prettyName() === name) ?? null;

        if (fixerClass) {
            // @ts-ignore
            return new fixerClass(issue);
        }

        return null;
    }

    public fixIssues(issues: RepositoryIssue[], issueTypeOrFixer: string, allowRisky: boolean) {
        issues.forEach(issue => this.fixIssue(issue, issueTypeOrFixer, allowRisky));
    }

    public fixIssue(issue: RepositoryIssue, issueTypeOrFixer: string, allowRisky: boolean) {
        const fixers = issue.fixers
            .filter(fixer => !this.isFixerDisabled(fixer.getClass()))
            .filter(fixer => fixer.getClass()
                .canFix(issue))
            .slice(0);

        let skippedFixers: string[] = [];
        let fixer = fixers.find(fixer => fixer.getName() === issueTypeOrFixer);
        const onlyRunOnce = fixer === undefined;

        if (fixer === undefined) {
            fixer = fixers.shift() ?? undefined;
        }

        let counter = 0;

        while (!issue.resolved && fixer !== undefined) {
            counter++;

            if (onlyRunOnce && counter > 1) {
                return;
            }

            if (fixer === undefined) {
                return;
            }

            if (issue.resolved) {
                return;
            }

            if (!allowRisky && fixer.isRisky()) {
                skippedFixers.push(fixer.getName());
                fixer = fixers.shift() ?? undefined;

                continue;
            }

            if (fixer.fix()) {
                return issue.resolve(fixer);
            }

            fixer = fixers.shift() ?? undefined;
        }

        skippedFixers = uniqueArray(skippedFixers);

        if (skippedFixers.length > 1) {
            issue.addResolvedNote(`skipped ${skippedFixers.length} fixers (risky)`);
        } else if (skippedFixers.length === 1) {
            issue.addResolvedNote(`skipped ${skippedFixers[0]} (risky)`);
        }

        if (!issue.resolved) {
            issue.addResolvedNote(`unresolved`, true);
        }
    }
}
