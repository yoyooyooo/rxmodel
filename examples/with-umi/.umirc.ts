import { IConfig } from 'umi-types';

// ref: https://umijs.org/config/
const config: IConfig = {
  treeShaking: true,
  routes: [
    {
      path: '/',
      component: '../layouts/index',
      routes: [{ path: '/', component: '../pages/index' }],
    },
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: false,
        dva: false,
        dynamicImport: { webpackChunkName: true },
        title: 'with-umi',
        dll: true,

        routes: {
          exclude: [/components\//],
        },
      },
    ],
    'umi-plugin-rxmodel',
  ],
};

export default config;
