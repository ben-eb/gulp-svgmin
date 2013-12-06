var es = require('event-stream');

module.exports = function() {
    'use strict';
    var svgo = new (require('svgo'))({ plugins: [arguments[0]] });
    return es.map(function(file, cb) {
        svgo.optimize(String(file.contents), function(result) {
            // If SVGO throws an error, pipe the original stream instead
            file.contents = (result.error) ? String(file.contents) : result.data;
            cb(null, file);
        });
    });
};
