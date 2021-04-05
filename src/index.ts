import { loadCommand } from './commands/Command';
import { init } from './lib/PrototypesInit';

init();

const yargs = require('yargs');

console.log(`\n*** READ THE README FIRST TO AVOID UNEXPECTED FILE CHANGES ***`);

yargs(process.argv.slice(2))
    //.scriptName('spatie-package')
    .version('1.0.0')
    .command(loadCommand(require('./commands/Analyze')))
    .command(loadCommand(require('./commands/Fix')))
    .command(loadCommand(require('./commands/PullTemplate')))
    .command(loadCommand(require('./commands/PullPackage')))
    .demandCommand()
    .help()
    .wrap(120).argv;
