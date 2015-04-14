'use strict';

var Transform = require('stream').Transform,
    SVGOptim = require('svgo'),
    PluginError = require('gulp-util').PluginError,

    PLUGIN_NAME = 'gulp-svgmin';

module.exports = function (options) {
    var stream = new Transform({objectMode: true});
    var svgo = new SVGOptim(options);

    stream._transform = function (file, encoding, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        if (file.isBuffer()) {
            svgo.optimize(String(file.contents), function (result) {
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
