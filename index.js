/* jshint node:true */

'use strict';

var map = require('map-stream');

module.exports = function() {
    var svgo = new (require('svgo'))({ plugins: [arguments[0]] });
    return map(function(file, cb) {
        svgo.optimize(String(file.contents), function(result) {
            if (result.error) {
                return cb(result.error);
            }
            file.contents = new Buffer(result.data);
            cb(null, file);
        });
    });
};
