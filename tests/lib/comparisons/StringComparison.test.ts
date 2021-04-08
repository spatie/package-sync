/* eslint-disable no-undef */

import { StringComparison } from '../../../src/lib/comparisions/StringComparison';

it('compares two strings', () => {
    expect(StringComparison.create('one two three', 'one two five'))
        .toMatchSnapshot();
    expect(StringComparison.create('one two three', 'one two three'))
        .toMatchSnapshot();
});

it('compares two equal strings', () => {
    expect(StringComparison.create('one two three', 'one two three').similarityScore)
        .toBe(1.0);
});

it('compares two strings and checks the minimum requirement', () => {
    expect(StringComparison.create('one two three', 'one two three')
        .meetsRequirement(0.3))
        .toBeTruthy();
    expect(StringComparison.create('one two three', 'five six seven')
        .meetsRequirement(0.9))
        .toBeFalsy();
});

it('returns the correct values for stringN properties', () => {
    expect(StringComparison.create('one two three', 'one two four').string1)
        .toBe('one two three');
    expect(StringComparison.create('one two three', 'one two four').string2)
        .toBe('one two four');
});
