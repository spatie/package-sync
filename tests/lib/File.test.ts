/* eslint-disable no-undef */

import { existsSync, readFileSync, unlinkSync } from 'fs';
import { File } from '../../src/lib/File';

const dataFilename = (filename: string) => `${__dirname}/../data/${filename}`;
const tempFilename = (filename: string) => `${__dirname}/../temp/${filename}`;

it('reads a file', () => {
    const f = File.read(dataFilename('testfile1.txt'));

    expect(f.contents.trim())
        .toStrictEqual('test one');
});

it('can set its contents without saving', () => {
    const filename = dataFilename('testfile1.txt');
    const f = File.read(filename);

    f.setContents('two');

    expect(f.contents)
        .toStrictEqual('two');
    expect(readFileSync(filename, { encoding: 'utf-8' })
        .trim())
        .toStrictEqual('test one');
});

it('can save its contents to another file', () => {
    const srcFilename = dataFilename('testfile1.txt');
    const destFilename = tempFilename('tempfile1.txt');

    if (existsSync(destFilename)) {
        unlinkSync(destFilename);
    }

    expect(existsSync(destFilename))
        .toBeFalsy();

    File.read(srcFilename)
        .saveAs(destFilename);

    expect(existsSync(destFilename))
        .toBeTruthy();
    expect(readFileSync(destFilename, { encoding: 'utf-8' })
        .trim())
        .toStrictEqual('test one');

    unlinkSync(destFilename);
});

it('can create a new file', () => {
    const fn = tempFilename('tempfile1.txt');
    const f = File.create(fn)
        .setContents('new file')
        .save();

    expect(readFileSync(fn, { encoding: 'utf-8' })
        .trim())
        .toStrictEqual(f.contents);

    unlinkSync(fn);
});

it('can delete a file', () => {
    const fn = tempFilename('tempfile1.txt');
    const f = File.create(fn)
        .setContents('new file')
        .save();

    expect(existsSync(fn))
        .toBeTruthy();

    f.delete();

    expect(existsSync(fn))
        .toBeFalsy();
});

it('can check if a file exists', () => {
    const fn1 = dataFilename('testfile1.txt');
    const fn2 = dataFilename('missingfile.txt');

    expect(File.create(fn1)
        .exists())
        .toBeTruthy();
    expect(File.create(fn2)
        .exists())
        .toBeFalsy();
});

it('can get the size of a file on disk', () => {
    const fn1 = dataFilename('testfile1.txt');
    const fn2 = dataFilename('missingfile.txt');

    expect(File.create(fn1).sizeOnDisk)
        .toBe(9);
    expect(File.create(fn2).sizeOnDisk)
        .toBe(0);
});

it('processes files with template variables', () => {
    const fn = dataFilename('template.txt');

    expect(File.create(fn)
        .processTemplate('my-package'))
        .toMatchSnapshot();
});
