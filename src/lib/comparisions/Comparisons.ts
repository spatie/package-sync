import { FileSizeComparison } from './FileSizeComparison';
import { StringComparison } from './StringComparison';

export class Comparisons {
    public static filesizes(sourceSize: number | undefined, targetSize: number | undefined) {
        return FileSizeComparison.create(sourceSize ?? 0, targetSize ?? 0);
    }

    public static strings(string1: string | undefined, string2: string | undefined) {
        return StringComparison.create(string1 || '', string2 || '');
    }
}
