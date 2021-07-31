const path = require('path');

module.exports = {
    entry: './app.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, './')]
            }
        ]
    },
    mode: "production"
}