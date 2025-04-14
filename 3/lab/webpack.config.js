const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    mode: "development",
    entry: "@/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            filename: "index.html",
        }),
    ],
    devServer: {
        compress: true,
        port: 9000,
        open: true,
        hot: true,
    },
};
