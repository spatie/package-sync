/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { Composer } from '../../../src/lib/composer/Composer';

const dataFilename = (filename: string) => `${__dirname}/../../data/${filename}`;
const tempFilename = (filename: string) => `${__dirname}/../../temp/${filename}`;

it('gets the required packages', () => {
    const c = new Composer(dataFilename('composer.json'));
    const pkgs = c.packages('require');

    expect(pkgs)
        .toHaveLength(3);
    expect(pkgs[0]?.name)
        .toBe('php');
});

it('gets the required-dev packages', () => {
    const c = new Composer(dataFilename('composer.json'));
    const pkgs = c.packages('require-dev');

    expect(pkgs)
        .toHaveLength(2);
    expect(pkgs[0]?.name)
        .toBe('phpunit/phpunit');
});

it('gets all package names', () => {
    const c = new Composer(dataFilename('composer.json'));
    const names = c.packageNames('all');

    expect(names)
        .toHaveLength(5);
    expect(names)
        .toContain('php');
    expect(names)
        .toContain('phpunit/phpunit');
});

it('gets all script names', () => {
    const c = new Composer(dataFilename('composer.json'));
    const names = c.scriptNames();

    expect(names)
        .toHaveLength(4);
    expect(names)
        .toContain('test');
    expect(names)
        .toContain('test-coverage');
});

it('gets all scripts', () => {
    const c = new Composer(dataFilename('composer.json'));
    const scripts = c.scripts();

    expect(scripts)
        .toHaveLength(4);
    expect(scripts[0]?.name)
        .toBe('test');
});

it('checks to see if a script exists', () => {
    const c = new Composer(dataFilename('composer.json'));

    expect(c.hasScript('test'))
        .toBeTruthy();
    expect(c.hasScript('missing'))
        .toBeFalsy();
});

it('creates a missing scripts section when adding a script', () => {
    const c = new Composer(dataFilename('composer.json'));

    delete c.rawData['scripts'];

    expect(c.rawData).not.toHaveProperty('scripts');

    c.addScript({ name: 'test', command: 'echo "hello world"' });

    expect(c.rawData)
        .toHaveProperty('scripts');
});

it('creates a missing require section when adding a package', () => {
    const c = new Composer(dataFilename('composer.json'));

    c.rawData['require'];

    delete c.rawData['require'];

    expect(c.rawData).not.toHaveProperty('require');

    c.addPackage({ name: 'test', section: 'require', version: '^1.0' });

    expect(c.rawData)
        .toHaveProperty('require');
});
