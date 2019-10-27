const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');
const EncodingPlugin = require('webpack-encoding-plugin');
 
module.exports = {
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
        title: 'Custom template',
        // Load a custom template (lodash by default see the FAQ for details)
        template: 'index.html'
    }),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery"
    }),
    new EncodingPlugin({
      encoding: 'utf-8'
  })
  ],
  module: {
    rules: [
      {test: /\.css$/i, use: ['style-loader', 'css-loader']},
      {test: /\.(png|jpg|gif)$/, use: ['url-loader']}
    ],
  }
}