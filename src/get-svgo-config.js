import cloneDeep from 'lodash.clonedeep';
import {loadConfig, extendDefaultPlugins} from 'svgo';

// To prevent multiple scans of the disk for a svgo.config.js file, keep its
// data in module scope.
const cache = {};

// Load the config from svgo.config.js.
const loadConfigFromCache = async (configFile, cwd) => {
    if (configFile !== null) {
        // Look for the config in the specified file. loadConfig() will
        // require() the file, which caches it for us.
        return loadConfig(configFile, cwd);
    }

    // Since no configFile was given, let loadConfig() find a file for us.

    // If the config file is not in our module cache, look for it on disk.
    if (!(cwd in cache)) {
        // Any usage of loadConfig() with the same cwd will return the same
        // file's config. Store the resulting config in our module cache.
        cache[cwd] = await loadConfig(null, cwd);
    }

    return cache[cwd];
};

export const getSvgoConfig = async function (
    options = null,
    doDeepClone = false
) {
    // Construct the svgo config from the given options.
    let config = {
        ...options,
    };

    // Get the options that are for this gulp plugin and not for svgo.
    const pluginOptions = {
        full: Boolean(config.full),
        configFile: config.configFile || null,
        cwd: config.cwd || process.cwd(),
    };
    delete config.full;
    delete config.configFile;
    delete config.cwd;

    // If the options.full flag is specified, then the given options are
    // considered to be the full svgo config.
    if (pluginOptions.full) {
        return config;
    }

    // Extract the svgo plugins list from the config as we will need to handle
    // them specially later.
    const plugins = config.plugins || [];
    delete config.plugins;

    const loadedConfig = await loadConfigFromCache(
        pluginOptions.configFile,
        pluginOptions.cwd
    );

    // Merge the given config with the config loaded from file. (If no
    // config file was found, svgo's loadConfig() returns null.)
    if (loadedConfig) {
        config = {
            // Since gulp-svgmin allows a function to modify config per-file, we
            // want to prevent that function from making modifications to the
            // returned config object that would bleed into subsequent usages of
            // the config object.
            ...(doDeepClone ? cloneDeep(loadedConfig) : loadedConfig),
            ...config,
        };
    }

    // Merge any plugins given in options.plugins.
    if (config.plugins) {
        // If plugins are provided in a config file, they are assumed to be
        // a final list of plugins; according to svgo version 2 docs, the
        // config file is responsible for merging the default plugins list.
        // So we just need to merge the options.plugins into the list loaded
        // from the config file.
        config.plugins = extendLoadedPlugins(config.plugins, plugins);
    } else {
        // Merge the default plugins list with options.plugins.
        config.plugins = extendDefaultPlugins(plugins);
    }

    return config;
};

// Based on svgo's extendDefaultPlugins().
const extendLoadedPlugins = (loadedPlugins, plugins) => {
    const pluginsOrder = [];
    const extendedPlugins = loadedPlugins.map((plugin) => {
        pluginsOrder.push(typeof plugin === 'string' ? plugin : plugin.name);
        return plugin;
    });

    for (const plugin of plugins) {
        const index = pluginsOrder.indexOf(
            typeof plugin === 'string' ? plugin : plugin.name
        );
        if (index === -1) {
            extendedPlugins.push(plugin);
        } else {
            extendedPlugins[index] = plugin;
        }
    }

    return extendedPlugins;
};
