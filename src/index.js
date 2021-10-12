import {Transform} from 'node:stream';
import Buffer from 'node:buffer';
import PluginError from 'plugin-error';
import {optimize} from 'svgo';
import {getSvgoConfig} from './get-svgo-config.js';

const PLUGIN_NAME = 'gulp-svgmin';

const gulpsvgmin = function (options) {
    const optionsFunction = typeof options === 'function';

    const stream = new Transform({objectMode: true});
    stream._transform = async function (file, encoding, cb) {
        if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        if (file.isBuffer()) {
            try {
                const config = await getSvgoConfig(
                    optionsFunction ? options(file) : options,
                    optionsFunction
                );
                const result = optimize(String(file.contents), config);

                // Ignore svgo meta data and return the SVG string.
                if (typeof result.data === 'string') {
                    file.contents = Buffer.from(result.data);
                    return cb(null, file);
                }

                // Otherwise, throw an error, even if it is undefined.
                throw result.error;
            } catch (error) {
                return cb(new PluginError(PLUGIN_NAME, error));
            }
        }

        // Handle all other cases, like file.isNull(), file.isDirectory().
        return cb(null, file);
    };

    return stream;
};

export default gulpsvgmin;
