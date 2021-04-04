# [gulp][gulp]-svgmin [![Build Status](https://travis-ci.org/ben-eb/gulp-svgmin.svg?branch=master)][ci] [![NPM version](https://badge.fury.io/js/gulp-svgmin.svg)][npm] [![Dependency Status](https://gemnasium.com/ben-eb/gulp-svgmin.svg)][deps]

> A gulp plugin to minify SVG files with [SVGO][orig].

*If you have any difficulties with the output of this plugin, please use the
[SVGO tracker][bugs].*

## Install

With [npm](https://npmjs.org/package/gulp-svgmin) do:

```
npm install gulp-svgmin
```

## Example

```js
import { src, dest } from 'gulp';
import svgmin from 'gulp-svgmin';

const defaultTask = () =>
  src('logo.svg')
    .pipe(svgmin())
    .pipe(dest('./out'));

export default defaultTask;
```

## Configuration file

By default, `gulp-svgmin` loads options from a `svgo.config.js` file in your project. See the [svgo’s configuration docs][config] for more info on how to write one.

You can control which directory `svgo` searches for `svgo.config.js` with the `cwd` option. Or you can use a different file name with the `configFile` option.

```js
import { src, dest } from 'gulp';
import svgmin from 'gulp-svgmin';

const defaultTask = () =>
  src('logo.svg')
    .pipe(svgmin({
      // Specify an absolute directory path to
      // search for the config file.
      cwd: '/users/admin/project/assets',
      // This path is relative to process.cwd()
      // or the 'cwd' option.
      configFile: 'images/svg/config.js',
    }))
    .pipe(dest('./out'));

export default defaultTask;
```

## Options

Instead of using a config file, you can pass an object of svgo’s options to the `gulp-svgmin` plugin. You will need to provide the config in comma separated objects, like the example below.

```js
const defaultTask = () =>
  src('logo.svg')
    .pipe(svgmin({
      // Ensures the best optimization.
      multipass: true,
      js2svg: {
        // Beutifies the SVG output instead of
        // stripping all white space.
        pretty: true,
        indent: 2,
      },
      // Alter the default list of plugins.
      plugins: [
        // You can enable a plugin with just its name.
        'sortAttrs',
        {
          name: 'removeViewBox',
          // Disable a plugin by setting active to false.
          active: false,
        },
        {
          name: 'cleanupIDs',
          // Add plugin options.
          params: {
            minify: true,
          }
        },
      ],
    }))
    .pipe(dest('./out'));
```

You can view the [full list of plugins here][plugins].

By default, the plugins list given to the gulp plugin will alter the default list of svgo plugins. Optionally, you can specify your plugins and set the `full` flag to `true` to indicate that your plugins list should not be merged with the default list of plugins.

```js
const defaultTask = () =>
  src('logo.svg')
    .pipe(svgmin({
      multipass: true,
      // The plugins list is the full list of plugins
      // to use. The default list is ignored.
      full: true,
      plugins: [
        'removeDoctype',
        'removeComments',
        'sortAttrs',
        // ...
      ],
    }))
    .pipe(dest('./out'));
```

## Per-file options

To have per-file options, pass a function, that receives `file` object and
returns `svgo` options. For example, if you need to prefix ids with filenames
to make them unique before combining svgs with [gulp-svgstore](https://github.com/w0rm/gulp-svgstore):

```js
const defaultTask = () =>
  src('src/*.svg')
    .pipe(svgmin(function getOptions(file) {
      const prefix = path.basename(
        file.relative,
        path.extname(file.relative)
      );
      return {
        plugins: [
          {
            name: 'cleanupIDs',
            parmas: {
              prefix: prefix + '-',
              minify: true,
            },
          },
        ],
      };
    }))
    .pipe(svgstore())
    .pipe(dest('./dest'));
```

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests to cover it.

## License

MIT © [Ben Briggs](http://beneb.info) and [John Albin Wilkins](http://john.albin.net)

[bugs]:    https://github.com/svg/svgo/issues
[ci]:      https://travis-ci.org/ben-eb/gulp-svgmin
[deps]:    https://gemnasium.com/ben-eb/gulp-svgmin
[gulp]:    https://github.com/wearefractal/gulp
[npm]:     http://badge.fury.io/js/gulp-svgmin
[orig]:    https://github.com/svg/svgo
[config]:  https://github.com/svg/svgo#configuration
[plugins]: https://github.com/svg/svgo#built-in-plugins
