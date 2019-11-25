import { join, basename, extname } from 'path';
import { readFileSync } from 'fs';
import globby from 'globby';
import { chunkName, findJS, optsToArray, endWithSlash } from 'umi-utils';

export function getModels(cwd, api) {
  const { config, winPath } = api;

  return globby
    .sync(`./rxmodels/**/*.{ts,tsx,js,jsx}`, {
      cwd,
    })
    .filter(
      p =>
        !p.endsWith('.d.ts') &&
        !p.endsWith('.test.js') &&
        !p.endsWith('.test.jsx') &&
        !p.endsWith('.test.ts') &&
        !p.endsWith('.test.tsx')
    )
    .map(p => api.winPath(join(cwd, p)));
}

export default api => {
  const { paths, winPath } = api;
  api.onGenerateFiles(() => {
    generateInitRxmodel();
  });

  function generateInitRxmodel() {
    const tpl = join(__dirname, './template/rxmodel.js.tpl');
    let tplContent = readFileSync(tpl, 'utf-8');
    const rxmodelJs = getRxmodelJs(); // 运行时
    tplContent = tplContent
      .replace('<%= ExtendDvaConfig %>', '')
      .replace('<%= RegisterPlugins %>', getPluginContent())
      .replace('<%= RegisterModels %>', getModelContent());
    if (rxmodelJs) {
      tplContent = tplContent.replace(
        '<%= ExtendDvaConfig %>',
        `
...((require('${rxmodelJs}').config || (() => ({})))()),
      `.trim()
      );
    }

    api.writeTmpFile('rxmodel.js', tplContent);
  }

  api.addEntryCodeAhead(`
  window.g_rxapp = require('./rxmodel').createApp();
`);

  api.addUmiExports([
    {
      specifiers: ['getApp'],
      source: './rxmodel',
    },
  ]);

  api.addPageWatcher([
    join(paths.absSrcPath, 'rxodels'),
    join(paths.absSrcPath, 'rxPlugins'),
    join(paths.absSrcPath, 'rxmodel.js'),
    join(paths.absSrcPath, 'rxmodel.jsx'),
    join(paths.absSrcPath, 'rxmodel.ts'),
    join(paths.absSrcPath, 'rxmodel.tsx'),
  ]);

  function getRxmodelJs() {
    const rxmodel = findJS(api.paths.absSrcPath, 'rxmodel');
    if (rxmodel) {
      return winPath(rxmodel);
    }
  }

  function getModelContent() {
    return getModels(api.paths.absSrcPath, api)
      .map(path =>
        `
  app.model({
    namespace: '${basename(path, extname(path))}',
    ...require('${path}').default,
  });`.trim()
      )
      .join('\r\n  ');
  }

  function getPluginContent() {
    const pluginPaths = globby.sync('rxPlugins/**/*.{js,ts}', {
      cwd: paths.absSrcPath,
    });
    return pluginPaths
      .map(path =>
        `
app.use(require('../../${path}').default);
  `.trim()
      )
      .join('\r\n  ');
  }
};
