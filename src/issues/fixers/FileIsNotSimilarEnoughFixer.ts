/* eslint-disable no-unused-vars */

import { classOf } from '../../lib/helpers';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { FixerManager } from '../FixerManager';
import { Fixer } from './Fixer';

const readline = require('readline');
const util = require('util');

export class FileIsNotSimilarEnoughFixer extends Fixer {
    public static handles = [ComparisonKind.FILE_NOT_SIMILAR_ENOUGH];

    public async promptUser(fixers: string[]) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const question = util.promisify(rl.question)
            .bind(rl);

        const askQuestion = async prompt => {
            let result;

            try {
                result = await question(`${prompt} `);
            } catch (err) {
                result = false;
            }

            return new Promise(resolve => resolve(result));
        };

        try {
            const input: string = <string>await askQuestion(`Run fixer '${fixers[0]}' on file '${this.issue.name}'? [y/N] `);

            if ((input.trim()
                .toLowerCase()[0] ?? 'n') !== 'y') {
                this.issue.resolve(classOf(this)
                    .prettyName())
                    .addResolvedNote('rejected running more fixers');

                this.issue.disableFixers();

                //this.issue.availableFixers.splice(0, this.issue.availableFixers.length);

                return;
            }

            this.issue.pending = false;

            FixerManager.create()
                .getFixerForIssue(fixers[0], this.issue)
                ?.fix();
        } finally {
            rl.close();
            this.issue.pending = false;
        }
    }

    public fix(): boolean {
        if (!this.shouldPerformFix()) {
            return true;
        }

        this.run();

        return true;
    }

    public async run() {
        this.issue.pending = true;
        this.issue.resolved = false;

        console.log(`FILE NOT SIMILAR FIXER: manual review required for '${this.issue.name}'`);

        const additionalFixers = this.issue.availableFixers.filter(name => name !== FileIsNotSimilarEnoughFixer.prettyName());

        if (additionalFixers.length > 0) {
            await this.promptUser(additionalFixers);
        }
    }

    public static prettyName(): string {
        return 'user-review';
    }
}
