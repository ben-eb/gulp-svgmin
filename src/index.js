import {Transform} from 'stream';
import SVGOptim from 'svgo';
import {PluginError} from 'gulp-util';

const PLUGIN_NAME = 'gulp-svgmin';

module.exports = function (opts) {
    const stream = new Transform({objectMode: true});
    let svgo;

    if (typeof opts !== 'function') {
        svgo = new SVGOptim(opts);
    }

    stream._transform = function (file, encoding, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        if (file.isBuffer()) {
            if (typeof opts === 'function') {
                svgo = new SVGOptim(opts(file));
            }

            svgo.optimize(String(file.contents), result => {
                if (result.error) {
                    return cb(new PluginError(PLUGIN_NAME, result.error));
                }
                file.contents = new Buffer(result.data);
                cb(null, file);
            });
        }
    };

    return stream;
};
