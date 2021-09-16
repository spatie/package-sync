/* eslint-disable no-undef */
import { RepositoryValidator } from '../../src/repositories/RepositoryValidator';
import FakePullCommand from '../helpers/FakePullCommand';

beforeEach(() => {
    FakePullCommand.handled = [];
});

it('ensures a package has been cloned or updated', () => {
    const dataPath = __dirname + '/../data';
    const validator = new RepositoryValidator(dataPath, dataPath, FakePullCommand, FakePullCommand);

    validator.ensurePackageExists('my-test-package');

    expect(FakePullCommand.handled)
        .toMatchSnapshot();
});

it('ensures a template has been cloned or updated', () => {
    const dataPath = __dirname + '/../data';
    const validator = new RepositoryValidator(dataPath, dataPath, FakePullCommand, FakePullCommand);

    validator.ensureTemplateExists('my-test-template');

    expect(FakePullCommand.handled)
        .toMatchSnapshot();
});
