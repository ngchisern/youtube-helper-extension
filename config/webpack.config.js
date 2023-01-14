'use strict';


const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

const Dotenv = require('dotenv-webpack');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify"),
      }
    },
    entry: {
      popup: PATHS.src + '/popup.js',
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
      settings: PATHS.src + '/settings.js',
    },
    plugins: [
      new Dotenv()
    ],
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
