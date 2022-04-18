const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: {
      index: path.resolve('jsx/index.jsx'),
      recipe: path.resolve('jsx/recipe.jsx'),
      register: path.resolve('jsx/register.jsx'),
      profile: path.resolve('jsx/profile.jsx')
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
            ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
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

