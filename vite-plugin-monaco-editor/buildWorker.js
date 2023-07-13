import path from 'node:path';
import fs from 'node:fs';
import esbuild from 'esbuild';

import { languageWorksByLabel } from './languageWork';

export function getFilenameByEntry(entry) {
  entry = path.basename(entry, 'js');
  return `${entry}.bundle.js`;
}

export function resolveMonacoPath(filePath) {
  if (require && typeof require.resolve === 'function') {
    try {
      return require.resolve(path.join(process.cwd(), 'node_modules', filePath));
    } catch (err) {
      return require.resolve(filePath);
    }
  }

  const file = path.join(process.cwd(), 'node_modules', `${filePath.replace('.js', '')}.js`);
  if (fs.existsSync(file)) return file;
  return filePath;
}

export const cacheDir = 'node_modules/.monaco/';

export function getWorkPath(works, options, config) {
  const workerPaths = {};

  for (const work of works) {
    if (isCDN(options.publicPath)) {
      workerPaths[work.label] = `${options.publicPath}/${getFilenameByEntry(work.entry)}`;
    } else {
      workerPaths[work.label] =
        `${config.base}${options.publicPath}/${getFilenameByEntry(work.entry)}`;
    }
  }

  if (workerPaths['typescript']) {
    // javascript shares the same worker
    workerPaths['javascript'] = workerPaths['typescript'];
  }
  if (workerPaths['css']) {
    // scss and less share the same worker
    workerPaths['less'] = workerPaths['css'];
    workerPaths['scss'] = workerPaths['css'];
  }
  if (workerPaths['html']) {
    // handlebars, razor and html share the same worker
    workerPaths['handlebars'] = workerPaths['html'];
    workerPaths['razor'] = workerPaths['html'];
  }

  return workerPaths;
}

export function getWorks(options) {
  let works = options.languageWorkers.map(
    (work) => languageWorksByLabel[work]
  );

  works.push(...options.customWorkers);

  return works;
}

export function isCDN(publicPath) {
  if (/^((http:)|(https:)|(file:)|(\/\/))/.test(publicPath)) {
    return true;
  }
  return false;
}

async function mkdir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath, {
      recursive: true,
    });
  }
  return dirPath;
}

export function build(entry) {
  const cacheDirPath = path.resolve(cacheDir);
  const cachePath = path.join(cacheDir, getFilenameByEntry(entry));

  return new Promise((resolve, reject) => {

    mkdir(cacheDirPath)
    .then(_ => {
      return esbuild.build({
        entryPoints: [resolveMonacoPath(entry)],
        bundle: true,
        format: 'iife',
        outfile: cachePath,
      });

    }).then(buildResult => {

      if(buildResult.errors.length) {
        reject(buildResult.errors);
      }
      resolve(cachePath);

    }).catch(reject);
  });
}

export async function buildAll(options, resolvedConfig) {
  // 是cdn地址并且没有强制构建worker cdn则返回
  if (isCDN(options.publicPath)) {
    return;
  }

  const works = getWorks(options);

  const distPath = options.customDistPath
    ? options.customDistPath(
        resolvedConfig.root,
        resolvedConfig.build.outDir
        // resolvedConfig.base
      )
    : path.join(
        resolvedConfig.root,
        resolvedConfig.build.outDir,
        // resolvedConfig.base,
        options.publicPath
      );

  // write publicPath
  if (!fs.existsSync(distPath)) {
    await fs.promises.mkdir(distPath, {
      recursive: true,
    });
  }

  for (const work of works) {
    const cachePath = await build(work.entry);

    const contentBuffer = await fs.promises.readFile(cachePath);
    const workDistPath = path.resolve(distPath, getFilenameByEntry(work.entry));
    await fs.promises.writeFile(workDistPath, contentBuffer);
  }
}