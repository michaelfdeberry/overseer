const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function(env) {
  const isDev = env.MODE === 'development';
  const buildTarget = env.BUILD_TARGET || 'remote';
  let distribution = path.resolve(__dirname, './dist');

  if (buildTarget === 'remote') {
    distribution = path.resolve(__dirname, '../server/public');
  }

  return {
    mode: env.MODE,
    entry: './app/index.tsx',

    resolve: {
      modules: [path.resolve(__dirname, './node_modules'), path.resolve(__dirname, '../common/node_modules')],
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
        {
          test: /\.ts(x?)$/,
          loader: 'awesome-typescript-loader',
        },
        {
          enforce: 'pre',
          test: /\.(t|j)s$/,
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

    node: {
      fs: 'empty',
    },

    output: {
      path: distribution,
      filename: isDev ? '[name].js' : '[name].[contenthash].js',
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
        if (buildTarget === 'remote' && resource.request.indexOf('local') >= 0) {
          resource.request = resource.request.replace(/local/g, `remote`);
        }
        return resource;
      }),
      new MiniCssExtractPlugin({
        filename: isDev ? 'styles.css' : 'styles.[contenthash].css',
        chunkFilename: isDev ? 'styles.css' : 'styles.[contenthash].css',
      }),
      new webpack.DefinePlugin({
        __isDev__: isDev,
        __isLocalApp__: buildTarget !== 'remote',
      }),
    ],

    devServer: {
      historyApiFallback: true,
    },
  };
};
