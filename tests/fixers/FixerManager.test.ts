/* eslint-disable no-undef */
import { FixerManager } from '../../src/fixers/FixerManager';
import { DirectoryNotFoundFixer } from '../../src/fixers/DirectoryNotFoundFixer';
import { FileNotFoundFixer } from '../../src/fixers/FileNotFoundFixer';
import { Configuration } from '../../src/Configuration';

it('gets the class of a fixer based on its name', () => {
    const fixers = [
        FixerManager.getFixerClass(FileNotFoundFixer.prettyName()),
        FixerManager.getFixerClass(DirectoryNotFoundFixer.prettyName()),
    ];

    expect(fixers[0])
        .toBe(FileNotFoundFixer);
    expect(fixers[1])
        .toBe(DirectoryNotFoundFixer);
    expect(FixerManager.getFixerClass('missing'))
        .toBeNull();
    expect(FixerManager.getFixerClass(''))
        .toBeNull();
});

it('correctly checks if a fixer is disabled', () => {
    const config = new Configuration(__dirname + '/../data/index.yml').conf;
    config.fixers.disabled = ['create-file'];

    const fm = new FixerManager(config);

    expect(fm.isFixerDisabled(FileNotFoundFixer))
        .toBeTruthy();
    expect(fm.isFixerDisabled(DirectoryNotFoundFixer))
        .toBeFalsy();
});
