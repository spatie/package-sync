/* eslint-disable no-undef */
import { compareFileSizes, FileSizeComparison } from '../../../src/lib/comparisions/FileSizeComparison';

it('compares two file sizes', () => {
    expect(FileSizeComparison.create(1000, 2000))
        .toMatchSnapshot();
    expect(FileSizeComparison.create(2000, 1000))
        .toMatchSnapshot();
    expect(FileSizeComparison.create(0, 50))
        .toMatchSnapshot();
    expect(FileSizeComparison.create(100, 100))
        .toMatchSnapshot();
    expect(FileSizeComparison.create(0, 0))
        .toMatchSnapshot();
});

it('checks if a comparison meets requirements', () => {
    expect(FileSizeComparison.create(100, 50)
        .meetsRequirement(20))
        .toBeTruthy();
    expect(FileSizeComparison.create(100, 200)
        .meetsRequirement(75))
        .toBeFalsy();
    expect(FileSizeComparison.create(100, 100)
        .meetsRequirement(75))
        .toBeFalsy();
});

it('returns the correct values for properties', () => {
    expect(FileSizeComparison.create(10, 20).filesize1)
        .toBe(10);
    expect(FileSizeComparison.create(10, 20).filesize2)
        .toBe(20);
    expect(FileSizeComparison.create(20, 10).difference)
        .toBe(10);
    expect(FileSizeComparison.create(20, 20).percentage)
        .toBe(0);
});

it('formats the percent difference for display', () => {
    expect(FileSizeComparison.create(100, 20)
        .format(0))
        .toBe('80%');
    expect(FileSizeComparison.create(100, 20)
        .format(1))
        .toBe('80.0%');
});

it('the helper function compareFileSizes() returns an instace of FileSizeComparison', () => {
    expect(compareFileSizes(100, 100))
        .toBeInstanceOf(FileSizeComparison);
});
