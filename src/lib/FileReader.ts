import { readFileSync } from 'fs';

export class FileReaderOld {
    static forCopy(fn: string): string {
        return readFileSync(fn, { encoding: 'utf-8' })
            .toString();
    }

    static forComparison(fn: string): string {
        return (
            readFileSync(fn, { encoding: 'utf-8' })
                .toString()
                // .replace(/\s{2,}/g, ' ')
                // .replace(/\n{2,}/g, '\n')
                .trim()
        );
    }

    static performReplacements(str: string, repoName: string): string {
        return str
            .replace(/:vendor_name/g, 'spatie')
            .replace(/:package_name/g, repoName)
            .replace(/author@domain\.com/g, 'freek@spatie.be')
            .replace(/:author_homepage/g, 'https://spatie.be/open-source/support-us');
    }

    static fromSkeleton(fn: string, repoName: string): string {
        return FileReaderOld.performReplacements(FileReaderOld.forComparison(fn), repoName);
    }

    static fromSkeletonForCopy(fn: string, repoName: string): string {
        return FileReaderOld.performReplacements(FileReaderOld.forCopy(fn), repoName);
        // .replace(/:vendor_name/g, 'spatie')
        // .replace(/:package_name/g, repoName)
        // .replace(/author@domain\.com/g, 'freek@spatie.be')
        // .replace(/:author_homepage/g, 'https://spatie.be/open-source/support-us');
    }
}

export class FileReader {
    protected data: string;

    constructor(protected fn: string) {
        this.data = readFileSync(fn, { encoding: 'utf-8' })
            .toString();
    }

    static create(fn: string) {
        return new FileReader(fn);
    }

    static contents(fn: string): string {
        return FileReader.create(fn).contents;
    }

    get filename() {
        return this.fn;
    }

    get contents() {
        return this.data;
    }

    public processTemplate(repoName: string): string {
        return this.data
            .replace(/:vendor_name/g, 'spatie')
            .replace(/:package_name/g, repoName)
            .replace(/author@domain\.com/g, 'freek@spatie.be')
            .replace(/:author_homepage/g, 'https://spatie.be/open-source/support-us');
    }
}
