module.exports = {
    customOption: 'tests/fixtures/config/simple.config.js',
    plugins: [
        {
            name: 'removeDoctype',
        },
        'removeComments',
        'removeMetadata',
    ],
};
