/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const moduleShared = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};

const serverConfig = {
  ...moduleShared,
  target: 'node',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      return pathData.chunk.name === 'main' ? 'index.js' : '[name].bundle.js';
    },
    library: {
      name: 'ytmusicapi',
      type: 'umd',
    },
  },
};

const clientConfig = {
  ...moduleShared,
  target: 'web',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      path: require.resolve('path-browserify'),
      https: false,
      'https-browserify': false,
      url: require.resolve('url/'),
      buffer: require.resolve('buffer/'),
      fs: false,
    },
  },
  // @codyduong TODO reenable when I'm not losing my sanity to webpack 5
  // externals: {
  //   path: 'path-browserify',
  //   url: 'url',
  //   buffer: 'buffer/',
  // },
  output: {
    asyncChunks: true,
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      return pathData.chunk.name === 'main'
        ? 'index.browser.js'
        : '[name].browser.bundle.js';
    },
    library: {
      name: 'ytmusicapi',
      type: 'umd',
    },
  },
};

module.exports = [serverConfig, clientConfig];
