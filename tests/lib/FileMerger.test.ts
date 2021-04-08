/* eslint-disable no-undef */

import { FileMerger } from '../../src/lib/FileMerger';

it('merges two text files together', () => {
    const fm = FileMerger.create()
        .add(`${__dirname}/../data/test-package-2/one.txt`)
        .add(`${__dirname}/../data/test-package-2/two.txt`);

    expect(fm.merge()).toMatchSnapshot();
});

it('merges the same text file twice correctly', () => {
    const fm = FileMerger.create()
        .add(`${__dirname}/../data/test-package-2/one.txt`)
        .add(`${__dirname}/../data/test-package-2/one.txt`);

    expect(fm.merge()).toBe(`one\nabc`);
});
