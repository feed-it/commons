# How to install the package

You just have to run the following command in your project: `pnpm add [-D] @lib-feedit/commons`.

If you want to specify the version you can use the `@[~^]x.x.x` suffix. Or use the `latest` tag (optionally).

After that, you can use the:
- client-side part using `import {...} from '@lib-feedit/commons/client`
- server-side part using `import {...} from '@lib-feedit/commons/server`

## Eslint config

For the client-side part, you can also import a custom eslint **flat** config.
It help supporting warnings using our custom hooks like [usePromise](src/client/hooks/usePromise.ts)

You can import it inside your `eslint.config.mjs` and add it has following:
```ecmascript 6
...
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import feeditEslint from '@lib-feedit/commons/eslint.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	...reactHooks.configs['recommended-latest'],
	...feeditEslint, // <- Add it here here after react-hooks plugin
    // Other configs...
];
```