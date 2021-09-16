/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { Application } from '../src/Application';
import { Configuration } from '../src/Configuration';
import { Repository, RepositoryKind } from '../src/repositories/Repository';

let conf: Configuration, app: Application, skeleton: Repository, repo: Repository;

beforeEach(() => {
    conf = new Configuration(__dirname + '/../data/index.yml');
    app = new Application(conf);

    skeleton = Repository.create(__dirname + '/data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/data/test-package-2', RepositoryKind.PACKAGE);

    skeleton.loadFiles();
    repo.loadFiles();
});

it.skip('checks the repo for files not in the template', () => {
    // app.checkRepoForFilesNotInSkeleton(repo, skeleton);
    // const issues = repo.issues.map(issue => ({
    //     name: issue.name,
    //     result: issue.result,
    //     score: issue.score,
    //     resolvedNotes: issue.resolvedNotes,
    // }));
    // expect(issues)
    //     .toMatchSnapshot();
});
