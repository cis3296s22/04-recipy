const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: {
      index: path.resolve('jsx/index.jsx')
//    viewer: path.resolve('jsx/viewer_index.jsx'),
//    editor: path.resolve('jsx/editor_index.jsx')
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        exclude: /node_modules/,
        use: [{loader: "babel-loader", options: {
          "presets": [
            "@babel/preset-env",
            "@babel/preset-react"
          ],
          "plugins": [
            ["@babel/plugin-transform-react-jsx", { "pragma":"React.createElement", "pragmaFrag":"React.Fragment" }],
            ["@babel/plugin-proposal-class-properties", { "loose": true }],
            ["@babel/plugin-proposal-private-methods", { "loose": true }],
            "@babel/plugin-proposal-optional-chaining"
          ]
        }}]
      }
    ]
  },
  plugins: [new ESLintPlugin({})],
  resolve: {
    alias: {
      jsx: path.resolve('jsx/'),
    },
    extensions: [".js", ".jsx", ".json"],
    mainFields: ["browser", "module", "main", "style"]
  },
};

