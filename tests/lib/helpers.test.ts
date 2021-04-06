/* eslint-disable no-undef */

import { isDirectory, last, uniqueArray, uniqueStrings } from '../../src/lib/helpers';

it('determines if a filesystem item is a directory', () => {
    expect(isDirectory(__dirname)).toBeTruthy();
    expect(isDirectory(__filename)).toBeFalsy();
});

it('ensures an array has only unique items', () => {
    expect(uniqueArray([1, 1, 2, 2, 3])).toStrictEqual([1, 2, 3]);
    expect(uniqueArray([1, 1, 1, 1])).toStrictEqual([1]);
    expect(uniqueArray([1, 2])).toStrictEqual([1, 2]);
});

it('ensures an array of strings has unique values', () => {
    expect(uniqueStrings(['aa', 'aa', 'bb'])).toStrictEqual(['aa', 'bb']);
    expect(uniqueStrings(['aa', '', 'bb', ''])).toStrictEqual(['aa', '', 'bb', '']);
});

it('gets the last item of an array', () => {
    const data = {
        one: [1, 2, 3],
        two: ['one', 'two', 'three'],
    };

    expect(last(data.one)).toBe(3);
    expect(last(data.two)).toBe('three');
    expect(last([])).toBeUndefined();
});
