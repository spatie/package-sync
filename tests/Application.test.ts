/* eslint-disable no-undef */

import { Application } from '../src/Application';
import { Configuration } from '../src/Configuration';
import { Repository, RepositoryKind } from '../src/repositories/Repository';
import { RepositoryFile } from '../src/repositories/RepositoryFile';
import { ComparisonKind } from '../src/types/FileComparisonResult';

let conf: Configuration, app: Application, skeleton: Repository, repo: Repository;

beforeEach(() => {
    conf = new Configuration(__dirname + '/../data/index.yml');
    app = new Application(conf);

    skeleton = Repository.create(__dirname + '/data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/data/test-package-2', RepositoryKind.PACKAGE);

    skeleton.loadFiles();
    repo.loadFiles();
});

it('performs a file exists comparison', () => {
    const file = <RepositoryFile>skeleton.getFile('testfile1.txt');
    const result = app.performFileExistsComparison(skeleton, repo, file);

    expect(result).toBeTruthy();
    expect(repo.issues).toHaveLength(1);
    expect(repo.issues[0].kind).toBe(ComparisonKind.FILE_NOT_FOUND);
});

it('performs a dir exists comparison', () => {
    const file = <RepositoryFile>skeleton.getFile('SOME_DIR');
    const result = app.performFileExistsComparison(skeleton, repo, file);

    expect(result).toBeTruthy();
    expect(repo.issues).toHaveLength(1);
    expect(repo.issues[0].kind).toBe(ComparisonKind.DIRECTORY_NOT_FOUND);
});
