/* eslint-disable no-undef */

import { LineMerger } from '../../src/lib/LineMerger';

it('merges lines into a single array', () => {
    const lm = new LineMerger();

    lm.add(['one', 'two', 'three', 'one', 'two', 'four']);

    //     lm.add(`
    // .idea
    // .php_cs
    // .php_cs.cache

    // .phpunit.result.cache
    // build
    // composer.lock
    // coverage

    // docs
    // phpunit.xml
    // psalm.xml
    // vendor
    // `);

    //     lm.add(`
    // build
    // composer.lock
    // docs
    // vendor
    // coverage
    // tests/server/package-lock.json
    // `);

    //     console.log(lm.merge());

    expect(lm.merge()).toStrictEqual(['one', 'two', 'three', 'four']);
});
