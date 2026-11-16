# Merge `uchimata-py` into `uchimata`

This plan describes the initial migration of the Python widget repository into the main `uchimata` repository. The goal is to make `uchimata` the home of one product with multiple entrypoints, while keeping the first merge low-disruption.

## Goals

- Treat Uchimata as one product with JavaScript and Python entrypoints.
- Keep the JavaScript visualization library as the source of truth for rendering behavior.
- Package the Python widget frontend from the local JavaScript code instead of importing `uchimata` from `esm.sh`.
- Publish a PyPI package that includes a prebuilt, self-contained widget frontend artifact.
- Keep npm and PyPI package versions and release workflows independent.
- Preserve the current JavaScript repository structure as much as possible.

## Non-goals for the first merge

Do not intentionally change:

- JavaScript visualization API.
- Python widget API.
- Data conversion behavior.
- Rendering behavior.
- Existing JavaScript source layout.
- Examples, except for required path/import fixes.

The first migration is about repository, packaging, CI, and release integration only.

## Decisions already made

- `uchimata` is one product with multiple supported entrypoints.
- The JavaScript visualization library owns rendering behavior.
- The Python widget is the Python notebook entrypoint and depends technically on the JavaScript visualization library.
- The Python widget frontend should be bundled from local JavaScript code, not loaded from `esm.sh`.
- The PyPI release should include one self-contained generated `widget.js` file. "Self-contained" means the Uchimata JavaScript code and its JS dependencies are bundled; the DuckDB-wasm engine (wasm + worker) used by JS selections is intentionally still fetched lazily from jsdelivr to keep bundle size down. The current widget frontend does not call JS selections (Python-side selections use Python `duckdb`), so the widget does not trigger that fetch.
- The generated widget frontend artifact should not be committed.
- npm and PyPI versions should remain independent.
- npm and PyPI release workflows should remain independent.
- `uchimata-py` history does not need to be preserved; copying files in one commit is acceptable.
- The old `uchimata-py` repository should get a README notice and then be archived on GitHub.
- Root-level Python project management files are acceptable.
- Python package source can initially remain under `uchimata-py/src/uchimata`.
- Continue using `hatchling` for Python builds, with a custom build hook if needed.
- The sdist contains only the Python package and the prebuilt `widget.js`, not the JavaScript sources. Building a wheel from the sdist must not require Node or pnpm.

Related ADRs:

- [0001: Package the Python widget with local JavaScript](./adr.md#0001-package-the-python-widget-with-local-javascript)
- [0002: Keep JavaScript and Python package versions independent](./adr.md#0002-keep-javascript-and-python-package-versions-independent)
- [0003: Ship the prebuilt widget frontend in the sdist, without JavaScript sources](./adr.md#0003-ship-the-prebuilt-widget-frontend-in-the-sdist-without-javascript-sources)
- [0004: Import the JavaScript visualization library into the widget frontend by relative path](./adr.md#0004-import-the-javascript-visualization-library-into-the-widget-frontend-by-relative-path)
- [0005: Tag Python releases with a separate `py-v` prefix](./adr.md#0005-tag-python-releases-with-a-separate-py-v-prefix)

## Target repository shape

Approximate initial shape:

```text
uchimata/
  package.json
  pnpm-lock.yaml
  pnpm-workspace.yaml
  src/                         # existing TypeScript source
  docs/
  examples/
  pyproject.toml               # moved/adapted from uchimata-py
  uv.lock                      # moved/adapted from uchimata-py
  uchimata-py/
    src/uchimata/              # Python package source
      __init__.py
      static/
        widget.js              # generated; ignored by Git
    tests/
    examples/
    docs/
    data/                      # if still useful
    sample_data/               # if still useful
```

The exact set of copied data/example files can be decided during implementation.

## Migration steps

### 1. Prepare the old `uchimata-py` repository

In the old repository:

1. Add a README notice that development has moved to `hms-dbmi/uchimata`.
2. Point issues, PRs, and documentation to the merged repository.
3. Archive the repository on GitHub after the merge is complete.

Decided: the old repository's GitHub Pages site (`hms-dbmi.github.io/uchimata-py/`, a WASM export of `examples/marimo/stevens2017.py` deployed by `.github/workflows/deploy.yml`) is discarded and not migrated. This repository keeps its single Pages site from `app-static-pages.yml`.

### 2. Copy Python project files

Copy from `uchimata-py` into this repository without preserving detailed Git history.

Likely copy:

```text
src/uchimata/     -> uchimata-py/src/uchimata/
tests/            -> uchimata-py/tests/
examples/         -> uchimata-py/examples/
docs/             -> uchimata-py/docs/
data/             -> uchimata-py/data/          # if still useful
sample_data/      -> uchimata-py/sample_data/   # if still useful
README.md         -> uchimata-py/README.md      # becomes the PyPI long description
```

`examples/` and `sample_data/` must keep their relative layout: notebooks reference data as e.g. `../../sample_data/test.arrow`. The tests build their data in memory and have no path dependencies.

Move/adapt to repo root:

```text
pyproject.toml
uv.lock
.python-version   # optional
```

Do not copy:

```text
.git/
.github/          # incl. the marimo Pages deploy, which is discarded (see step 1)
.gitignore        # entries already ported to the root .gitignore (step 6)
deno.json         # Deno tooling is dropped (step 4a)
arraydata.arrow   # stray file at the old repo root
```

### 3. Configure Python packaging from the root

Adapt root `pyproject.toml` so the package named `uchimata` is built from:

```text
uchimata-py/src/uchimata
```

Expected hatch configuration will be along these lines, to be verified during implementation:

```toml
[tool.hatch.build.targets.wheel]
packages = ["uchimata-py/src/uchimata"]

[tool.hatch.build.targets.sdist]
only-include = ["uchimata-py/src/uchimata", "uchimata-py/README.md", "LICENSE"]

[tool.hatch.build]
artifacts = ["uchimata-py/src/uchimata/static/widget.js"]
```

`artifacts` is required: `widget.js` is gitignored, and hatch otherwise silently leaves gitignored files out of the sdist and wheel.

Note that `uv build` / `python -m build` build the wheel *from the unpacked sdist* in a temporary directory, so the wheel build cannot rely on the JavaScript sources being present.

Other `pyproject.toml` changes needed because it now lives at the root:

- `readme = "uchimata-py/README.md"`. The old `readme = "README.md"` would resolve to the JavaScript README and put it on the PyPI page.
- `project.urls` point to `hms-dbmi/uchimata`.
- Add `[tool.pytest.ini_options] testpaths = ["uchimata-py/tests"]` so pytest doesn't walk the whole repo.
- Rename the deprecated `[tool.uv] dev-dependencies` to `[dependency-groups] dev = [...]`.
- Remove the `"uchimata"` dev dependency and its `[tool.uv.sources] uchimata = { workspace = true }` self-reference; `uv sync` already installs the root project in editable mode.
- Keep `[tool.marimo.runtime] output_max_bytes`; verify marimo still picks it up for notebooks under `uchimata-py/examples/` by running one of the larger examples.

`uv.lock` can be moved as is: it records the project as `editable = "."`, which stays correct next to the root `pyproject.toml`. Run `uv lock` after the edits above, commit the result, and add `uv lock --check` to CI.

### 4. Replace the widget frontend's remote JS dependency

Current widget frontend imports the published npm package from `esm.sh`:

```js
import * as uchi from "https://esm.sh/uchimata@^0.3.x";
```

Replace this with a local build/bundle flow:

1. Maintain a widget frontend source file that imports the local JavaScript package/source.
2. Bundle that frontend into one self-contained ESM file.
3. Write the generated artifact to:

```text
uchimata-py/src/uchimata/static/widget.js
```

The generated artifact must be ignored by Git.

Decided: the widget frontend source imports the JavaScript visualization library by relative path to `src/main.ts` (not by package name), so a single watcher rebuilds `widget.js` on changes to either the widget source or the library, and no separate `pnpm build` of `dist/` is needed.

Proposed layout and scripts (to confirm during implementation):

- widget frontend source: `uchimata-py/js/widget.ts` (the current `widget.js`, ported to TypeScript, with the esm.sh import replaced by the relative import);
- separate Vite config, e.g. `vite.widget.config.ts`, building that entry as a single ES module into `uchimata-py/src/uchimata/static/widget.js` (`emptyOutDir: false`);
- `pnpm build:widget` (one-off build) and `pnpm dev:widget` (`--watch`).

### 4a. Local development workflow

```sh
pnpm dev:widget                      # rebuilds static/widget.js on changes to src/ or the widget source
ANYWIDGET_HMR=1 uv run jupyter lab   # anywidget reloads the frontend when widget.js changes
```

- Drop the Deno tooling from `uchimata-py` (`deno.json`, `@deno-types` comments, the `localhost:5173` type import); the widget source is type-checked by the root `tsc` and linted by Biome. Add `@anywidget/types` as a devDependency.
- With `skip-if-exists` in the build hook, `uv sync` only builds `widget.js` when it is missing, so it can go stale after pulling JS changes. Contributor docs should say to run `pnpm build:widget` or keep `pnpm dev:widget` running.
- Verify whether the `uchimata = { workspace = true }` self-reference in the old `[tool.uv]` config is still needed once `pyproject.toml` is at the root.
- Verify that live reload works in marimo as well as Jupyter.

### 5. Build the Python widget frontend during package builds

Use `hatchling`, likely with a custom build hook similar to `manzt/quak`.

The build hook should:

1. build the local JavaScript package as needed;
2. bundle the Python widget frontend against that local JavaScript code;
3. produce `uchimata-py/src/uchimata/static/widget.js` before wheel/sdist creation;
4. ensure the generated file is included in the PyPI artifacts;
5. skip the JavaScript build when `widget.js` already exists (the wheel-from-sdist case, where JS sources are absent);
6. fail the build if `widget.js` is missing after the hook runs.

Before writing a custom hook, check whether `hatch-jupyter-builder` (used by the anywidget template and, as far as we know, `manzt/quak`) covers this via its `skip-if-exists` and `ensured-targets` options:

```toml
[tool.hatch.build.hooks.jupyter-builder]
build-function = "hatch_jupyter_builder.npm_builder"
ensured-targets = ["uchimata-py/src/uchimata/static/widget.js"]
skip-if-exists = ["uchimata-py/src/uchimata/static/widget.js"]
dependencies = ["hatch-jupyter-builder>=0.5.0"]

[tool.hatch.build.hooks.jupyter-builder.build-kwargs]
npm = "pnpm"
build_cmd = "build:widget"
```

Normal Python users should not need Node or pnpm to install or use the PyPI package. Node/pnpm are development and release-build requirements only.

### 6. Update `.gitignore`

Ignore generated Python widget frontend artifacts, at minimum:

```text
uchimata-py/src/uchimata/static/widget.js
```

Done alongside this plan: the `uchimata-py` `.gitignore` entries (`.venv`, `__pycache__`, `.ipynb_checkpoints`; `node_modules`, `dist`, `.DS_Store` were already covered) and the `widget.js` entry were ported to the root `.gitignore`. `.venv` matters beyond Git: Biome reads `.gitignore`, and an unignored `.venv` would make local `biome check .` scan third-party JS in site-packages.

Decided: Python build output goes to `uchimata-py/dist/`, not the root `dist/`. The root `dist/` is the JavaScript library build output, Vite does not clear it (`emptyOutDir: false`), and npm publishes it (`"files": ["dist"]`), so Python wheels/sdists there could end up in the npm package. uv has no config-file setting for the output directory, so every Python build must pass it explicitly:

```sh
uv build --out-dir uchimata-py/dist --clear
```

Use this in CI, the PyPI workflow, and contributor docs (optionally wrapped as a `build:py` script in the root `package.json`). Also set `[tool.hatch.build] directory = "uchimata-py/dist"` so `hatch build` matches. The existing `dist` pattern in `.gitignore` already covers `uchimata-py/dist/`.

The widget Vite config must not copy `rollupOptions.external: ["three"]` from `vite.config.ts`: `widget.js` has to bundle `three`.

### 7. Add CI jobs

Keep existing JavaScript checks:

- install pnpm;
- run JavaScript tests;
- run typecheck;
- run lint.

Add Python checks:

- install uv;
- install Python dependencies;
- run Python tests;
- build Python package.

Add at least one integration/package smoke check:

- build the widget frontend from local JavaScript;
- build the Python wheel;
- confirm `widget.js` is included in both the sdist and the wheel;
- build a wheel from the sdist in an environment without Node, install it into a clean venv, and import the package;
- ideally run Python tests against the generated frontend.

### 8. Keep release workflows independent

#### npm

Keep the existing npm/Changesets release flow mostly unchanged. It should publish only the JavaScript package.

`changeset publish` publishes every non-private package in the pnpm workspace whose version is not yet on npm. This already caused `docs/` to be published to npm as `uchimata-examples@0.0.1` (2025-08-28). Rules:

- Every `package.json` other than the root one must set `"private": true` (`docs/package.json` fixed alongside this plan).
- The widget frontend source stays outside the pnpm workspace and has no `package.json` of its own; its dev dependencies (e.g. `@anywidget/types`) go in the root `package.json`.
- Do not copy any `package.json` from `uchimata-py` without making it private.

#### PyPI

Add a separate PyPI release workflow (`uchimata-py` currently has none; its one release, `v0.4.0`, was published manually). It should:

1. build the widget frontend from local JavaScript;
2. build wheel and sdist;
3. publish only the Python package.

Do not require npm and PyPI versions to match.

Tagging and triggers (decided, see ADR 0005):

- npm and PyPI packages are both named `uchimata`, and Changesets already tags npm releases as `uchimata@<version>`. Python releases therefore use a distinct prefix, `py-v<version>`, never `uchimata@…` or bare `v…`.
- The PyPI workflow triggers only on `push: tags: ["py-v*"]` (plus `workflow_dispatch`). It must not trigger on `release: published`, because `changesets/action` creates a GitHub Release for every npm publish.
- The job installs pnpm and Node in addition to uv, since building the sdist runs the widget build hook.
- Publish via PyPI Trusted Publishing (`id-token: write`); configure the trusted publisher on PyPI for `hms-dbmi/uchimata` and the new workflow file.
- Keep a static `version` in `pyproject.toml`; add a step that fails if the tag version does not match it.
- Python GitHub Releases, if created, should not be marked "Latest", so the npm release keeps that badge.

### 9. Documentation updates

Minimum documentation updates:

- Update root README to describe both JavaScript and Python entrypoints.
- Remove or update references that point users to the old `uchimata-py` repository as the active home.
- Remove or update references to `esm.sh` in the Python widget implementation/docs.
- Update PyPI project URLs to the merged repository.

The root README can be refined separately after the migration mechanics are in place.

## Suggested implementation order

1. Copy Python files into `uchimata-py/` and move/adapt root Python project files.
2. Configure `pyproject.toml` to build from `uchimata-py/src/uchimata`.
3. Get existing Python tests running from the merged repo.
4. Add a local widget frontend source and bundling script.
5. Generate `uchimata-py/src/uchimata/static/widget.js` from local JS.
6. Add hatch build hook to generate/include the frontend artifact.
7. Add/update `.gitignore`.
8. Add CI Python jobs and integration smoke check.
9. Add/adapt PyPI release workflow.
10. Update docs and old-repo notice.

## Open implementation details

These should be resolved while implementing:

- Confirm the proposed widget frontend source location (`uchimata-py/js/widget.ts`) and Vite config (see step 4).
- Check `widget.js` bundle size: `src/selections/selections.ts` instantiates `DuckDBSingleton` at module load, which may keep unused DuckDB-wasm JS in the bundle.
- Build hook: confirm `hatch-jupyter-builder` covers the requirements in step 5; write a custom hook only if not.
- Whether all Python examples/data should be copied immediately or trimmed.
