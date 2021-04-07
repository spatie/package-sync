import { loadCommand } from './commands/Command';

const yargs = require('yargs');

yargs(process.argv.slice(2))
    .scriptName('package-sync')
    .version('1.0.0')
    .command(loadCommand(require('./commands/Analyze')))
    .command(loadCommand(require('./commands/Fix')))
    .command(loadCommand(require('./commands/ListFixers')))
    .command(loadCommand(require('./commands/PullTemplate')))
    .command(loadCommand(require('./commands/PullPackage')))
    .demandCommand()
    .help()
    .wrap(120).argv;
