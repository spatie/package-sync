/* eslint-disable no-undef */

// import { basename } from 'path';
// //import { Application } from '../src/Application';
// import { Repository, RepositoryKind } from '../src/lib/Repository';
// import { RepositoryFile } from '../src/lib/RepositoryFile';

// it('compares a package repository and a skeleton repository', () => {
//     const skeleton = Repository.create(__dirname+'/data/test-skeleton', RepositoryKind.SKELETON);
//     const repo = Repository.create(__dirname+'/data/test-package', RepositoryKind.PACKAGE);

//     skeleton.fileList = <RepositoryFile[]>skeleton.files.map(f => RepositoryFile.create(f.relativeName, '--'));
//     skeleton.composer.fromJson(skeleton.composer.toJson().replace(new RegExp(process.cwd(), 'g'), ''));
//     skeleton.composer.filename = basename(skeleton.composer.filename);
//     skeleton.path = basename(skeleton.path);

//     repo.fileList = <RepositoryFile[]>repo.files.map(f => RepositoryFile.create(f.relativeName, '--'));
//     repo.composer.fromJson(repo.composer.toJson().replace(new RegExp(process.cwd(), 'g'), ''));
//     repo.composer.filename = basename(repo.composer.filename);
//     repo.path = basename(repo.path);

//     //app.compareRepositories(skeleton, repo)

//     //expect(repo).toMatchSnapshot();

// });

it('does nothing', () => {
    expect(1)
        .toBe(1);
});

export {};
