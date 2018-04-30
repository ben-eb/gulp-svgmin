"use strict"

var path = require("path")
var _stream = require("stream")
var _svgo = require("svgo")
var _svgo2 = _interopRequireDefault(_svgo)
var _gulpUtil = require("gulp-util")
var _chalk = require("chalk")
var _fancyLog = require("fancy-log")
var _logSymbols = require("log-symbols")
var _prettyBytes = require("pretty-bytes")

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

var PLUGIN_NAME = "gulp-svgmin"

module.exports = function(opts) {
  var stream = new _stream.Transform({ objectMode: true })
  var svgo = void 0

  if (typeof opts !== "function") {
    svgo = new _svgo2.default(opts)
  }

  stream._transform = function(file, encoding, cb) {
    if (file.isNull()) {
      return cb(null, file)
    }

    if (file.isStream()) {
      return cb(
        new _gulpUtil.PluginError(PLUGIN_NAME, "Streaming not supported")
      )
    }

    if (file.isBuffer()) {
      if (typeof opts === "function") {
        svgo = new _svgo2.default(opts(file))
      }

      svgo.optimize(String(file.contents), function(result) {
        if (result.error) {
          return cb(new _gulpUtil.PluginError(PLUGIN_NAME, result.error))
        }
        const saved = file.contents.length - result.data.length
        const percentage = saved / file.contents.length * 100
        _fancyLog(
          `${_logSymbols.success} ${file.relative} ${_chalk.gray(
            `(saved ${_chalk.bold(_prettyBytes(saved))} ${Math.round(
              percentage
            )}%)`
          )}`
        )
        file.contents = new Buffer(result.data)
        cb(null, file)
      })
    }
  }

  return stream
}
