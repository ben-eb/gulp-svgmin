'use strict';

var Transform = require('stream').Transform,
    SVGOptim = require('svgo'),
    gutil = require('gulp-util');

var PLUGIN_NAME = 'gulp-svgmin';

module.exports = function(options) {
    var stream = new Transform({objectMode: true});
    var svgo = new SVGOptim(options);

    stream._transform = function(file, unused, done) {
        if (file.isStream()) {
            return done(new gutil.PluginError(PLUGIN_NAME, "Streaming not supported"));
        }

        if (file.isBuffer()) {
            svgo.optimize(String(file.contents), function(result) {
                if (result.error) {
                    return done(new gutil.PluginError(PLUGIN_NAME, result.error));
                }
                file.contents = new Buffer(result.data);
                done(null, file);
            });
        } else {
            // When null just pass through
            done(null, file);
        }
    };

    return stream;
};
