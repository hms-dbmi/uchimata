# Architecture decision records

## 0001: Package the Python widget with local JavaScript

The Python widget will use the JavaScript visualization library from the same repository instead of importing a published package from esm.sh. This makes the merged repository meaningful as an integration boundary: CI and releases can verify that the Python widget works with the JavaScript code in the same commit, and PyPI releases can package the matching widget frontend.

## 0002: Keep JavaScript and Python package versions independent

Uchimata is one product with JavaScript and Python entrypoints, but the npm and PyPI packages will keep independent version numbers. The Python widget depends on the JavaScript visualization API, so compatibility is still required, but independent versions allow ecosystem-specific releases instead of forcing every npm release and PyPI release to happen in lockstep.

## 0003: Ship the prebuilt widget frontend in the sdist, without JavaScript sources

The Python sdist contains only the Python package and the generated `widget.js`, not the JavaScript sources. `uv build` and other build frontends build the wheel from the unpacked sdist, and downstream packagers such as conda-forge build from the sdist too, so this keeps every build from the sdist free of Node and pnpm. The build hook builds the widget frontend when the JavaScript sources are present and skips that step when `widget.js` already exists. The trade-off is that the sdist contains generated JavaScript rather than only source files, which is common for anywidget packages.

## 0004: Import the JavaScript visualization library into the widget frontend by relative path

The widget frontend source imports the JavaScript visualization library from `src/main.ts` by relative path, not by package name through a pnpm workspace package. With a package-name import, the widget would be built against the library's `dist/` output, so development would need a second watcher rebuilding the library, and the widget would need its own `package.json`, which Changesets would try to publish. With the relative path, one watcher rebuilds `widget.js` whenever either the widget source or the library changes, and the widget source stays outside the pnpm workspace.

## 0005: Tag Python releases with a separate `py-v` prefix

The npm and PyPI packages are both named `uchimata`, and Changesets already tags npm releases as `uchimata@<version>`. Because the versions are independent (0002), Python release tags would clash with or be mistaken for npm ones. Python releases are therefore tagged `py-v<version>`, and the PyPI workflow triggers only on those tags. It does not trigger on GitHub Releases, because `changesets/action` creates one for every npm publish.
