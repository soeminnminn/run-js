import * as monaco from 'monaco-editor';

import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

if (import.meta.env.PROD) {
	self.MonacoEnvironment = {
		getWorkerUrl(_, label) {
			if (label === 'json') {
				return '/workers/json.worker.js';

			} else if (label === 'css' || label === 'scss' || label === 'less') {
				return '/workers/css.worker.js';

			} else if (label === 'html' || label === 'handlebars' || label === 'razor') {
				return '/workers/html.worker.js';
				
			} else if (label === 'typescript' || label === 'javascript') {
				return '/workers/ts.worker.js';
			}
			return '/workers/editor.worker.js';
		}
	};

} else {
	self.MonacoEnvironment = {
		getWorker(_, label) {
			if (label === 'json') {
				return new jsonWorker();

			} else if (label === 'css' || label === 'scss' || label === 'less') {
				return new cssWorker();

			} else if (label === 'html' || label === 'handlebars' || label === 'razor') {
				return new htmlWorker();

			} else if (label === 'typescript' || label === 'javascript') {
				return new tsWorker();
			}
			return new editorWorker();
		},
	};
}

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);