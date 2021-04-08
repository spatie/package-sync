/* eslint-disable no-unused-vars */

import { ComparisonScoreRequirements } from '../types/ComparisonScoreRequirements';
import { File } from '../lib/File';

export class RepositoryFile extends File {
    public shouldIgnore = false;
    public shouldCompare = false;
    public requiredScores: ComparisonScoreRequirements = { similar: 0, size: 0 };

    /**
     *
     * @param repository Repository class
     * @param fn string
     * @param contents string | null
     */
    constructor(public repository: any, protected fn: string, contents: string | null = null) {
        super(fn, contents);
    }

    get relativeName() {
        return this.fn.replace(this.repository.path + '/', '');
    }

    public withOptions(ignore: boolean, compare: boolean, requiredScores: ComparisonScoreRequirements) {
        this.shouldIgnore = ignore;
        this.shouldCompare = compare;
        this.requiredScores = requiredScores;
        //
        return this;
    }

    public processTemplate(): string {
        return super.processTemplate(this.repository.name);
    }
}
