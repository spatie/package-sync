/* eslint-disable no-undef */

import { ComposerComparer } from '../../../src/lib/composer/ComposerComparer';

it('compares packages between two directories', () => {
    const results = ComposerComparer.comparePackages(
        `${__dirname}/../../data/test-skeleton`,
        `${__dirname}/../../data/test-package`,
    )
        .map(result => ({ kind: result.kind, name: result.name, score: result.score, ctx: result.context }));

    expect(results)
        .toMatchSnapshot();
});

it('compares scripts between two directories', () => {
    const results = ComposerComparer.compareScripts(
        `${__dirname}/../../data/test-skeleton`,
        `${__dirname}/../../data/test-package`,
    )
        .map(result => ({ kind: result.kind, name: result.name, score: result.score, ctx: result.context }));

    expect(results)
        .toMatchSnapshot();
});
