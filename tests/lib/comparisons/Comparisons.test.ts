/* eslint-disable no-undef */
import { Comparisons } from '../../../src/lib/comparisions/Comparisons';
import { FileSizeComparison } from '../../../src/lib/comparisions/FileSizeComparison';
import { StringComparison } from '../../../src/lib/comparisions/StringComparison';

it('returns an instance of StringComparison', () => {
    expect(Comparisons.strings('one', 'two'))
        .toBeInstanceOf(StringComparison);
    expect(Comparisons.strings(undefined, undefined))
        .toBeInstanceOf(StringComparison);
});

it('returns an instance of FileSizeComparison', () => {
    expect(Comparisons.filesizes(100, 200))
        .toBeInstanceOf(FileSizeComparison);
    expect(Comparisons.filesizes(undefined, undefined))
        .toBeInstanceOf(FileSizeComparison);
});
