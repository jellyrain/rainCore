import { uglify } from 'rollup-plugin-uglify'

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/rainCore.min.js',
        format: 'umd',
        name: 'rainCore',
        sourcemap: true
    },
    plugins: [
        uglify()
    ]
}