import { uniqueStrings } from './helpers';

export class LineMerger {
    public lines: string[];

    constructor() {
        this.lines = [];
    }

    public add(data: string | string[]) {
        if (!Array.isArray(data)) {
            const lines = data.trim()
                .split('\n');
            this.lines.push(...lines);
        } else {
            this.lines.push(...data);
        }

        return this;
    }

    public merge(): string[] {
        const result: string[] = this.lines.slice(0);

        return uniqueStrings(
            result.map(line => line.trim()),
            // strip comments at the end of the line
            //.map(line => line.replace(/(.+)\s*(#.*)$/m, '$1'))
            // strip comments at the start of the line
            //.filter(line => !line.startsWith('#'))
            //.filter(line => line.length > 0)
        );
    }
}
