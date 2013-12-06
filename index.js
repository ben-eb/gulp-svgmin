var es = require('event-stream');

module.exports = function() {
    'use strict';
    var svgo = new (require('svgo'))({ plugins: [arguments[0]] });
    return es.map(function(file, cb) {
        svgo.optimize(String(file.contents), function(result) {
            if (result.error) return cb(result.error);
            file.contents = new Buffer(result.data);
            cb(null, file);
        });
    });
};
