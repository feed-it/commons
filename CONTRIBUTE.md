# How to contribute to this package

How to dev on this package locally only

## 1. Setup

First, run these commands here to set up the base dev environnement:

- `pnpm run build` - Locally build the package in `dist` folder.
- `pnpm link` - Create a symlink to this package.
- `pnpm run dev` - Use to automatically rebuild the package when there are changes.
- `pnpm run build` - Alternatively, use this command if you want to manually rebuild the package.

In a side project of your choice, install the local package with `pnpm link @feed-it/commons`

## 2. Rules & Tips

- Typescript is mandatory, otherwise the releases cannot work. 
- The commits **need** to respect the [Angular commit names convention](https://www.conventionalcommits.org/fr/v1.0.0/), so the releases can work.

If you are new here, take a moment to understand:

- The project architecture
- How the composants are imported in each `index.ts` so they can be compiled and accessible when the package is imported.
- How the differents types are declared and exported.
- Make sure to difference `type` and `interface`.
- Do not use `export` on everything for nothing. Same for adding anything in `index.ts` files.
- Do not use `export default` on something you want to be exported and accessible (in `index.ts`), it will not be compiled.

The best example on how to split files, use differents `export` and others is the [Table Component](./src/components/Table).

## 3. Release

When you have finished your work and committed it. Run `pnpm run release` and go to [repository actions](https://github.com/feed-it/commons/actions) to watch the ci/cd pipeline running.