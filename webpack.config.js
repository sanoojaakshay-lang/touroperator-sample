const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/js/main.js',  // your main JS file
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',  // cache-busting filename
        clean: true,  // clean /dist before build
        assetModuleFilename: 'images/[name][ext]'  // images go to images folder
    },
    module: {
        rules: [
            // CSS Loader
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            // Images Loader
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/i,
                type: 'asset/resource'
            },
            // Fonts (optional if you use fonts)
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]'
                }
            },
            // JSON Loader (optional since fetch works)
            {
                test: /\.json$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'data/[name][ext]'
                }
            }
        ]
    },
    plugins: [
        // HTML plugin to inject bundle.js
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        // Copy static assets (images and JSON)
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/images', to: 'images', noErrorOnMissing: true },
                { from: 'src/data', to: 'data', noErrorOnMissing: true }
            ]
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist')
        },
        compress: true,
        port: 8080,
        hot: true,
        open: true
    },
    resolve: {
        extensions: ['.js', '.css', '.json']
    },
    mode: 'development',  // default mode (change to production for build)
    devtool: 'source-map' // optional, for debugging
};
