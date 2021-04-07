/* eslint-disable no-undef */

import { isDirectory, last, matches, uniqueArray, uniqueStrings } from '../../src/lib/helpers';

it('determines if a filesystem item is a directory', () => {
    expect(isDirectory(__dirname))
        .toBeTruthy();
    expect(isDirectory(__filename))
        .toBeFalsy();
});

it('ensures an array has only unique items', () => {
    expect(uniqueArray([1, 1, 2, 2, 3]))
        .toStrictEqual([1, 2, 3]);
    expect(uniqueArray([1, 1, 1, 1]))
        .toStrictEqual([1]);
    expect(uniqueArray([1, 2]))
        .toStrictEqual([1, 2]);
});

it('ensures an array of strings has unique values', () => {
    expect(uniqueStrings(['aa', 'aa', 'bb']))
        .toStrictEqual(['aa', 'bb']);
    expect(uniqueStrings(['aa', '', 'bb', '']))
        .toStrictEqual(['aa', '', 'bb', '']);
});

it('gets the last item of an array', () => {
    const data = {
        one: [1, 2, 3],
        two: ['one', 'two', 'three'],
    };

    expect(last(data.one))
        .toBe(3);
    expect(last(data.two))
        .toBe('three');
    expect(last([]))
        .toBeUndefined();
});

it('matches a string against patterns', () => {
    expect(matches('test', ['t*', '*t']))
        .toBeTruthy();
    expect(matches('test', 'a*'))
        .toBeFalsy();
    expect(matches('test', '*'))
        .toBeTruthy();
    expect(matches('', '*'))
        .toBeFalsy();
});

it('matches an array of strings against patterns', () => {
    expect(matches(['foo', 'bar'], ['f*', 'b*']))
        .toBeTruthy();
    expect(matches(['far', 'bar'], 'b*'))
        .toBeTruthy();
    expect(matches(['test', 'abc'], 'te*'))
        .toBeTruthy();
    expect(matches(['foo', 'bar'], 'x*'))
        .toBeFalsy();
    expect(matches(['far', 'bar'], '!*ar'))
        .toBeFalsy();
    expect(matches(['foo', 'bar'], '*'))
        .toBeTruthy();
});
