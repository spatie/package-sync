/* eslint-disable no-unused-vars */

import { ComparisonScoreRequirements } from '../types/ComparisonScoreRequirements';

export interface FileEntry {
    isFile: boolean;
    name: string;
    relativeName: string;
    filesize: number;
    shouldIgnore: boolean;
    shouldCompare: boolean;
    requiredScores: ComparisonScoreRequirements;
}

export class FileEntryArray extends Array<FileEntry> {
    constructor(entries: Array<any> | number) {
        if (Array.isArray(entries)) {
            super(...entries);
        } else {
            super(entries);
        }

        Object.setPrototypeOf(this, Object.create(FileEntryArray.prototype));
    }

    public containsEntry(entry: FileEntry): boolean {
        return !!(this.find(file => file.relativeName === entry.relativeName) || false);
    }

    public findByRelativeName(relativeName: string): FileEntry | null {
        return this.find(file => file.relativeName === relativeName) || null;
    }
}
