import PluginError from 'plugin-error';
import {Transform} from 'stream';
import {optimize} from 'svgo';
import {getSvgoConfig} from './get-svgo-config.js';

const PLUGIN_NAME = 'gulp-svgmin';

module.exports = function (options) {
    const optionsFunction = typeof options === 'function';

    const stream = new Transform({objectMode: true});
    stream._transform = function (file, encoding, cb) {
        if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        if (file.isBuffer()) {
            getSvgoConfig(
                optionsFunction ? options(file) : options,
                optionsFunction
            )
                .then((config) => {
                    const result = optimize(String(file.contents), config);

                    // Ignore svgo meta data and return the SVG string.
                    if (typeof result.data === 'string') {
                        file.contents = Buffer.from(result.data);
                        return cb(null, file);
                    }

                    // Otherwise, throw an error, even if it is undefined.
                    throw result.error;
                })
                .catch((error) => cb(new PluginError(PLUGIN_NAME, error)));

            return;
        }

        // Handle all other cases, like file.isNull(), file.isDirectory().
        return cb(null, file);
    };

    return stream;
};
