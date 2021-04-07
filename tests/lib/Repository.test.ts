/* eslint-disable no-undef */

import { basename } from 'path';
import { Repository, RepositoryKind } from '../../src/lib/Repository';
import { RepositoryFile } from '../../src/lib/RepositoryFile';

it('loads a repository directory', () => {
    const repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    repo.fileList = <RepositoryFile[]>repo.files.map(f => RepositoryFile.create(f.relativeName, f.contents));
    repo.composer.filename = basename(repo.composer.filename);
    repo.path = basename(repo.path);

    expect(repo).toMatchSnapshot();
});

it('gets a file object by name', () => {
    const repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    const file = repo.getFile('composer.json');

    expect(file).not.toBeNull();
    expect(repo.files.find(f => f.relativeName === file?.relativeName)).toBeInstanceOf(RepositoryFile);
});

it('checks if it has a file object', () => {
    const repo = Repository.create(__dirname + '/../data/test-package', RepositoryKind.PACKAGE);

    expect(repo.hasFile(<RepositoryFile>repo.getFile('composer.json'))).toBeTruthy();
    expect(repo.hasFile(<RepositoryFile>RepositoryFile.create('missing.txt'))).toBeFalsy();
});
