import { File } from './File';
import { LineMerger } from './LineMerger';

export class FileMerger {
    public merger: LineMerger;

    constructor() {
        this.merger = new LineMerger();
    }

    static create(): FileMerger {
        return new FileMerger();
    }

    public add(...filenames: string[]) {
        filenames.forEach(fn => {
            this.merger.add(File.contents(fn));
        });

        return this;
    }

    public merge(): string {
        return this.merger.merge()
            .join('\n');
    }

    public mergeAndSave(targetFile: string) {
        File.create(targetFile)
            .setContents(this.merge())
            .save();
    }
}
