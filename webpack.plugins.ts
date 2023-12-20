import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require('copy-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DotenvFlow = require('dotenv-flow-webpack');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'src/assets/images',
        to: 'assets/images',
      },
    ],
  }),
  new DotenvFlow({
    default_node_env: 'development',
    safe: false,
    system_vars: true,
    silent: false,
    encoding: 'utf8',
    defaults: false,
  }),
];
