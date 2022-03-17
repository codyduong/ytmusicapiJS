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
  ...moduleShared,
};

const clientConfig = {
  target: 'web',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      url: require.resolve('url/'),
      buffer: require.resolve('buffer/'),
      fs: false,
    },
  },
  externals: {
    crypto: 'crypto-browserify',
    path: 'path-browserify',
    https: 'https-browserify',
    stream: 'stream-browserify',
    http: 'stream-http',
    url: 'url',
    buffer: 'buffer/',
  },
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
  ...moduleShared,
};

module.exports = [serverConfig, clientConfig];
