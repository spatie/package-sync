/* eslint-disable no-undef */
import { FixerManager } from '../../src/issues/FixerManager';
import { DirectoryNotFoundFixer } from '../../src/issues/fixers/DirectoryNotFoundFixer';
import { FileNotFoundFixer } from '../../src/issues/fixers/FileNotFoundFixer';

it('gets the class of a fixer based on its name', () => {
    const fixers = [
        FixerManager.getFixerClass(FileNotFoundFixer.prettyName()),
        FixerManager.getFixerClass(DirectoryNotFoundFixer.prettyName()),
    ];

    expect(fixers[0]).toBe(FileNotFoundFixer);
    expect(fixers[1]).toBe(DirectoryNotFoundFixer);
    expect(FixerManager.getFixerClass('missing')).toBeNull();
    expect(FixerManager.getFixerClass('')).toBeNull();
});
