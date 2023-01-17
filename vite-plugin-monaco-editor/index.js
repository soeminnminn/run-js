import path from 'node:path';
import fs from 'node:fs';

import { languageWorksByLabel } from './languageWork';
import { isCDN, cacheDir, getWorks, getWorkPath, getFilenameByEntry, build, buildAll } from './buildWorker';

export default function monacoEditorPlugin(options = {}) {
  const languageWorkers = options.languageWorkers || (Object.keys(languageWorksByLabel));
  const publicPath = options.publicPath || 'monacoeditorwork';
  const globalAPI = options.globalAPI || false;
  const customWorkers = options.customWorkers || [];
  const forceBuildCDN = options.forceBuildCDN || false;

  options = {
    ...options,
    languageWorkers,
    publicPath,
    globalAPI,
    customWorkers,
    forceBuildCDN,
  };

  let resolvedConfig;

  return {
    name: 'vite-plugin-moncao-editor',
    configResolved(getResolvedConfig) {
      resolvedConfig = getResolvedConfig;
    },
    configureServer(server) {
      if (isCDN(publicPath)) {
        return;
      }

      const works = getWorks(options);
      // clear cacheDir

      if (fs.existsSync(cacheDir)) {
        fs.rmdirSync(cacheDir, { recursive: true, force: true });
      }

      for (const work of works) {
        server.middlewares.use(
          `${resolvedConfig.base}${options.publicPath}/${getFilenameByEntry(work.entry)}`,

          async function (req, res, next) {
            const cachePath = path.join(cacheDir, getFilenameByEntry(work.entry));

            if (!fs.existsSync(cachePath)) {
              await build(work.entry);
            }
            
            const contentBuffer = fs.readFileSync(cachePath);
            res.setHeader('Content-Type', 'text/javascript');
            res.end(contentBuffer);
          }
        );
      }
    },
    transformIndexHtml() {
      const works = getWorks(options);
      const workerPaths = getWorkPath(works, options, resolvedConfig);

      const globals = {
        MonacoEnvironment: `(function (paths) {
          return {
            globalAPI: ${globalAPI},
            getWorkerUrl : function (moduleId, label) {
              var result =  paths[label];
              if (/^((http:)|(https:)|(file:)|(\\/\\/))/.test(result)) {
                var currentUrl = String(window.location);
                var currentOrigin = currentUrl.substr(0, currentUrl.length - window.location.hash.length - window.location.search.length - window.location.pathname.length);
                if (result.substring(0, currentOrigin.length) !== currentOrigin) {
                  var js = '/*' + label + '*/importScripts("' + result + '");';
                  var blob = new Blob([js], { type: 'application/javascript' });
                  return URL.createObjectURL(blob);
                }
              }
              return result;
            }
          };
        })(${JSON.stringify(workerPaths, null, 2)})`,
      };

      const descriptor = [
        {
          tag: 'script',
          children: Object.keys(globals)
            .map((key) => `self[${JSON.stringify(key)}] = ${globals[key]};`)
            .join('\n'),
          injectTo: 'head-prepend',
        },
      ];
      return descriptor;
    },
    writeBundle() {
      if (isCDN(publicPath) && !forceBuildCDN) {
        return;
      }
      buildAll(options, resolvedConfig);
    }
  };
}