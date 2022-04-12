const { realpathSync, existsSync, statSync } = require('fs');
const { chdir } = require('process');
const { sep } = require('path');

const args = process.argv.slice(2);
const baseDir = realpathSync(`${__dirname}/..`);
const pkg = require(`${baseDir}/package.json`);

function fileSize(fn) {
    if (!existsSync(fn)) {
        return `0.0 kb`;
    }
    const stat = statSync(fn);
    return ((stat.isFile() ? stat.size : 0.0) / 1024).toFixed(1) + ' kb';
}

let options = {
    minify: process.env.NODE_ENV === 'production',
    quiet: false,
};

if (args.includes('--prod') || args.includes('--production')) {
    options.minify = true;
}

if (args.includes('--dev') || args.includes('--development')) {
    options.minify = false;
}

if (args.includes('--quiet')) {
    options.quiet = true;
}

chdir(baseDir);

if (typeof pkg['main'] === 'undefined') {
    pkg['main'] = 'dist/package-sync.js';
}

const buildConfig = {
    entryPoints: [`${baseDir}/src/index.ts`],
    bundle: true,
    outfile: `${baseDir}/${pkg.main}`,
    write: true,
    platform: 'node',
    format: 'cjs',
    target: ['node14'],
    define: {
        __APP_VERSION__: `"${pkg.version}"`,
    },
    logLevel: 'error',
    minify: options.minify,
};

const start = new Date()
    .getTime();
const result = require('esbuild')
    .buildSync(buildConfig);
const elapsed = new Date()
    .getTime() - start;

if (typeof result['errors'] !== 'undefined' && result.errors.length) {
    if (!options.quiet) {
        console.log('* There were errors while building. Failed.');
        console.log(result['errors']);
    }

    process.exit(1);
}

if (!options.quiet) {
    console.log(
        `* Build completed in ${elapsed}ms (${buildConfig.outfile.replace(baseDir + sep, '')} - ${fileSize(buildConfig.outfile)})`,
    );
    console.log(
        `* Version: ${buildConfig.define.__APP_VERSION__.replace(/"/g, '')} (${options.minify ? 'production' : 'development'})`,
    );
    console.log('');
}
