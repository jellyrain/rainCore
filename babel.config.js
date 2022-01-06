module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                corejs: { version: 3 },
                targets: {
                    ios: '6',
                    android: '4',
                    chrome: '60',
                    firefox: '60',
                    ie: '8',
                    safari: '10',
                    edge: '17',
                    opera: '10'
                }
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: ["@babel/plugin-transform-runtime"]
}