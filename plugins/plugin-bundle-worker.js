// https://github.com/vitejs/vite/discussions/1791
import esbuild from 'esbuild';
import path from 'node:path';

export default (publicDir) => {
  let outdir = '';

  return {
    name: 'vite-plugin-bundle-worker',
    configureServer(server) {
      const rootDir = server.config.root;
      if (publicDir) {
        outdir = path.join(publicDir, 'workers');
      } else {
        outdir = path.join(rootDir, 'public', 'workers');
      }
    },
    async transform(_, id) {
      if (/\?worker/.test(id)) {
        const entry = id.replace(/\?[\w-]+/, ''); 
        
        try {
          const result = await esbuild.build({
            entryPoints: [entry],
            bundle: true,
            format: 'iife',
            outdir
          });

          if(result.errors.length) {
            console.error(result.errors);
            return;
          }

          const fileName = path.basename(path.resolve(entry));
          return `export default function() {
            return new Worker("/workers/${fileName}")
          }`;
        } catch(e) {
          console.error(e);
        }
      }
    }
  }
};