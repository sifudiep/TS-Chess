// import path from "path"
const path = require("path")

module.exports = {
    entry: "./app.ts",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname)]
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "main.js"
    },
    mode: "production"
}