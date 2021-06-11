import {Transform} from 'node:stream';
import SVGOptim from 'svgo';
import PluginError from 'plugin-error';

const PLUGIN_NAME = 'gulp-svgmin';

export default function min(options) {
    const stream = new Transform({objectMode: true});
    let svgo;

    if (typeof options !== 'function') {
        svgo = new SVGOptim(options);
    }

    stream._transform = function (file, encoding, cb) {
        if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        if (file.isBuffer()) {
            if (typeof options === 'function') {
                svgo = new SVGOptim(options(file));
            }

            svgo.optimize(String(file.contents)).then(
                (result) => {
                    file.contents = Buffer.from(result.data);
                    cb(null, file);
                },
                (error) => {
                    cb(new PluginError(PLUGIN_NAME, error));
                }
            );

            return;
        }

        // Handle all other cases, like file.isNull(), file.isDirectory().
        return cb(null, file);
    };

    return stream;
}
