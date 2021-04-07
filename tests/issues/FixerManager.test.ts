/* eslint-disable no-undef */
import { FixerManager } from '../../src/issues/FixerManager';
import { DirectoryNotFoundFixer } from '../../src/issues/fixers/DirectoryNotFoundFixer';
import { FileNotFoundFixer } from '../../src/issues/fixers/FileNotFoundFixer';

it('gets the class of a fixer based on its name', () => {
    const fixers = [
        FixerManager.getFixerClass(FileNotFoundFixer.prettyName()),
        FixerManager.getFixerClass(DirectoryNotFoundFixer.prettyName()),
        FixerManager.getFixerClass('missing'),
        FixerManager.getFixerClass(''),
    ];

    expect(fixers[0]).not.toBeNull();
    expect(fixers[0])
        .toBe(FileNotFoundFixer);
    expect(fixers[1]).not.toBeNull();
    expect(fixers[1])
        .toBe(DirectoryNotFoundFixer);
    expect(fixers[2])
        .toBeNull();
    expect(fixers[3])
        .toBeNull();
});
