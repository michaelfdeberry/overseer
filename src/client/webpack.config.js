const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function(env) {
  const isDev = env.MODE === 'development';
  const serviceTarget = env.SERVICE_TARGET || 'remote';
  let distribution = path.resolve(__dirname, './dist');

  if (serviceTarget === 'remote') {
    distribution = path.resolve(__dirname, '../server/public');
  }

  return {
    mode: 'production',
    entry: './app/index.tsx',

    resolve: {
      modules: [path.resolve(__dirname, './node_modules'), path.resolve(__dirname, '../lib/node_modules')],
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          loader: 'awesome-typescript-loader',
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
            },
          ],
        },
      ],
    },

    output: {
      filename: isDev ? '[name].js' : '[name].[contenthash].js',
      path: distribution,
    },

    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },

    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({ template: './index.html' }),
      new CopyPlugin([{ from: './public', to: distribution }]),
      new webpack.NormalModuleReplacementPlugin(/(.*)operations(.*)/, function(resource) {
        if (serviceTarget === 'remote') {
          return resource.request.replace('local', `remote`);
        }
        return resource;
      }),
      new MiniCssExtractPlugin({
        filename: isDev ? 'styles.css' : 'styles.[contenthash].css',
        chunkFilename: isDev ? 'styles.css' : 'styles.[contenthash].css',
      }),
    ],

    devServer: {
      historyApiFallback: true,
    },
  };
};
