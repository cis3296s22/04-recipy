#!/usr/bin/env node

const process = require('process');
const fs = require('fs');

// Hackery to make the requires work...
__dirname = process.cwd();

let webpack = null;
try {
    webpack = require('webpack');
} catch (e) {
    console.log("Cannot find webpack. Did you forget to run `npm install`?");
    process.exit(1);
}

const args = process.argv[0].endsWith('node') ? process.argv.slice(2) : process.argv.slice(1);
const cmd = args[0];
const static_url = args[1];
const app = args[2]; // whatever app is being built
const is_prod = args[3] == 'production';

let webpack_config_path = null;
for (const filename of fs.readdirSync(process.cwd())) {
    if (filename.endsWith('.webpack.config.js')) {
        webpack_config_path = filename;
        break;
    }
}

function build_compiler() {
    console.log("Using config:", webpack_config_path)
    webpack_config_path = process.cwd() + '/' + webpack_config_path
    let config = require(webpack_config_path);
    config.mode = is_prod ? 'production' : 'development';

    delete config.devtool;
    if (!is_prod) {
        config.devtool = 'source-map';
    }

    if (!config.stats) {
        config.stats = {
            entrypoints: false,
            performance: true,
            children: false,
            modules: false,
            excludeAssets: /\.(map|gz)$/,
            assetsSort: "name",
            version: false,
            hash: false
        };
    }

    if (!config.output) {
        config.output = {
            path: '/webpack_dist/' + app + "/",
            filename: "[name].js",
            strictModuleExceptionHandling: true
        };
    }

    if (!config.performance) {
        config.performance = {hints: false};
    }

    config.output.publicPath = static_url;
    return webpack(config);
}

if (cmd === 'build') {
    let compiler = build_compiler();
    compiler.run((err, stats) => { // [Stats Object](#stats-object)
        if (err) console.log(err);
        if (stats) console.log(stats.toString());
        compiler.close(closeErr => {
            if (closeErr) conosole.log(closeErr);
        });
    });
} else if (cmd === 'watch') {
    const compiler = build_compiler();
    const watching = compiler.watch({
        // Example [watchOptions](/configuration/watch/#watchoptions)
        aggregateTimeout: 300,
        poll: undefined
    }, (err, stats) => { // [Stats Object](#stats-object)
        if (err) {
            console.log(err);
        }
        console.log(stats.toString());
    });

    function handler() {
        watching.close(closeErr => {
            if (closeErr) {
                console.log('Failed to stop watching: ', closeErr);
            } else {
                console.log('Watching Ended.');
            }

            process.exit(0);
        });
    }

    for (const sig of ['SIGINT', 'SIGTERM']) {
        process.on(sig, handler);
    }
}

