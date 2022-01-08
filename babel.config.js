module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                corejs: { version: 3 },
                targets: '> 1%, not dead'
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: ["@babel/plugin-transform-runtime"]
}