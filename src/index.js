import {Transform} from 'stream';
import SVGOptim from 'svgo';
import PluginError from 'plugin-error';

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

            svgo.optimize(String(file.contents))
                .then(result => {
                    file.contents = Buffer.from(result.data);
                    cb(null, file);
                }, error => {
                    cb(new PluginError(PLUGIN_NAME, error));
                });
        }
    };

    return stream;
};
