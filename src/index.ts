/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */

import { loadCommand } from './commands/Command';

const yargs = require('yargs');

yargs(process.argv.slice(2))
    .scriptName('package-sync')
    // @ts-ignore
    .version(__APP_VERSION__) // this const is defined by esbuild at compile time
    .command(loadCommand(require('./commands/Analyze')))
    .command(loadCommand(require('./commands/Fix')))
    .command(loadCommand(require('./commands/ListFixers')))
    .command(loadCommand(require('./commands/PullTemplate')))
    .command(loadCommand(require('./commands/PullPackage')))
    .demandCommand()
    .help()
    .wrap(120).argv;
