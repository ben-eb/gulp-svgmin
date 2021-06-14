import test from 'ava';
import path from 'path';
import {extendDefaultPlugins} from 'svgo';
import {getSvgoConfig} from '../src/get-svgo-config.js';

const defaultPlugins = extendDefaultPlugins([]);
const fixturesDirectory = path.resolve(__dirname, 'fixtures');

test('should return the default plugins list if given no options', async (t) => {
    const result = await getSvgoConfig();

    const expected = {plugins: defaultPlugins};

    t.deepEqual(result, expected);
});

test('should remove gulp-svgmin options from svgo config', async (t) => {
    const result = await getSvgoConfig({
        full: true,
        configFile: 'config/does-not-exist.config.js',
        cwd: fixturesDirectory,
        multipass: true,
        plugins: ['removeDoctype'],
    });

    t.deepEqual(result, {
        multipass: true,
        plugins: ['removeDoctype'],
    });
});

test('should not merge default plugins or look for a config file if given the "full" flag', async (t) => {
    const result = await getSvgoConfig({
        full: true,
        configFile: 'config/simple.config.js',
        cwd: fixturesDirectory,
        plugins: ['examplePlugin'],
    });

    t.deepEqual(result, {
        plugins: ['examplePlugin'],
    });
});

test('should merge default plugins with given options', async (t) => {
    const result = await getSvgoConfig({
        multipass: true,
        plugins: [
            {
                name: 'removeDoctype',
                active: false,
            },
        ],
    });

    const expected = {
        multipass: true,
        plugins: [
            {
                name: 'removeDoctype',
                active: false,
            },
            ...defaultPlugins.filter(
                (plugin) => plugin.name !== 'removeDoctype'
            ),
        ],
    };

    t.deepEqual(result, expected);
});

test('should search for a svg.config.js file starting with the "cwd" option', async (t) => {
    const result = await getSvgoConfig({
        cwd: path.resolve(fixturesDirectory, 'config'),
    });

    t.deepEqual(result, {
        customOption: 'tests/fixtures/config/svgo.config.js',
        plugins: ['removeDoctype'],
    });
});

test('should load a specific config file with the "configFile" option', async (t) => {
    const result = await getSvgoConfig({
        configFile: 'config/simple.config.js',
        cwd: fixturesDirectory,
    });

    t.deepEqual(result, {
        customOption: 'tests/fixtures/config/simple.config.js',
        plugins: [{name: 'removeDoctype'}, 'removeComments', 'removeMetadata'],
    });
});

test('should merge the given options with the "configFile" option', async (t) => {
    const result = await getSvgoConfig({
        configFile: 'config/simple.config.js',
        cwd: fixturesDirectory,
        multipass: true,
        plugins: [
            'removeDoctype',
            {
                name: 'removeComments',
                active: false,
            },
            {
                name: 'removeElementsByAttr',
                params: {
                    class: ['removeMe'],
                },
            },
        ],
    });

    t.deepEqual(result, {
        customOption: 'tests/fixtures/config/simple.config.js',
        multipass: true,
        plugins: [
            'removeDoctype',
            {
                name: 'removeComments',
                active: false,
            },
            'removeMetadata',
            {
                name: 'removeElementsByAttr',
                params: {
                    class: ['removeMe'],
                },
            },
        ],
    });
});

test('should load svgo.config.js from cache on repeated attempts', async (t) => {
    const cached = await getSvgoConfig({
        cwd: path.resolve(__dirname, 'fixtures/config/cached'),
    });

    t.deepEqual(cached, {
        customOption: 'tests/fixtures/config/cached/svgo.config.js',
        cacheModified: {value: false},
        plugins: ['onlyOnePlugin'],
    });

    // The getSvgoConfig() function does a shallow copy of the cache by default,
    // so we can modify deep objects and check for the modification when
    // re-loading.
    cached.cacheModified.value = 'cached value';

    const secondRequest = await getSvgoConfig({
        cwd: path.resolve(__dirname, 'fixtures/config/cached'),
    });

    t.deepEqual(secondRequest, {
        customOption: 'tests/fixtures/config/cached/svgo.config.js',
        cacheModified: {value: 'cached value'},
        plugins: ['onlyOnePlugin'],
    });
});

test('should prevent modification of svgo.config.js when the doDeepClone argument is true', async (t) => {
    const cached = await getSvgoConfig(
        {
            cwd: path.resolve(__dirname, 'fixtures/config/deep-clone'),
        },
        true
    );

    t.deepEqual(cached, {
        customOption: 'tests/fixtures/config/deep-clone/svgo.config.js',
        cacheModified: {value: false},
        plugins: ['onlyOnePlugin'],
    });

    // Try to change the cached value.
    cached.cacheModified.value = 'cached value';

    const secondRequest = await getSvgoConfig(
        {
            cwd: path.resolve(__dirname, 'fixtures/config/deep-clone'),
        },
        true
    );

    t.deepEqual(secondRequest, {
        customOption: 'tests/fixtures/config/deep-clone/svgo.config.js',
        cacheModified: {value: false},
        plugins: ['onlyOnePlugin'],
    });
});

test('should throw an error if the config file does not exist', async (t) => {
    await t.throwsAsync(
        getSvgoConfig({
            configFile: 'config/does-not-exist.config.js',
            cwd: fixturesDirectory,
        }),
        {
            instanceOf: Error,
            code: 'MODULE_NOT_FOUND',
        }
    );
});
