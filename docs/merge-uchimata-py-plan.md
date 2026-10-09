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
- The PyPI release should include one self-contained generated `widget.js` file.
- The generated widget frontend artifact should not be committed.
- npm and PyPI versions should remain independent.
- npm and PyPI release workflows should remain independent.
- `uchimata-py` history does not need to be preserved; copying files in one commit is acceptable.
- The old `uchimata-py` repository should get a README notice and then be archived on GitHub.
- Root-level Python project management files are acceptable.
- Python package source can initially remain under `uchimata-py/src/uchimata`.
- Continue using `hatchling` for Python builds, with a custom build hook if needed.

Related ADRs:

- [`0001-package-python-widget-with-local-javascript.md`](./adr/0001-package-python-widget-with-local-javascript.md)
- [`0002-keep-javascript-and-python-package-versions-independent.md`](./adr/0002-keep-javascript-and-python-package-versions-independent.md)

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
```

Move/adapt to repo root:

```text
pyproject.toml
uv.lock
.python-version   # optional
```

Do not copy:

```text
.git/
.github/
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

[tool.hatch.build]
artifacts = ["uchimata-py/src/uchimata/static/widget.js"]
```

Also update metadata such as project URLs so they point to the merged repository.

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

### 5. Build the Python widget frontend during package builds

Use `hatchling`, likely with a custom build hook similar to `manzt/quak`.

The build hook should:

1. build the local JavaScript package as needed;
2. bundle the Python widget frontend against that local JavaScript code;
3. produce `uchimata-py/src/uchimata/static/widget.js` before wheel/sdist creation;
4. ensure the generated file is included in the PyPI artifacts.

Normal Python users should not need Node or pnpm to install or use the PyPI package. Node/pnpm are development and release-build requirements only.

### 6. Update `.gitignore`

Ignore generated Python widget frontend artifacts, at minimum:

```text
uchimata-py/src/uchimata/static/widget.js
```

Also review whether other generated build outputs from the copied Python project should be ignored.

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
- confirm `widget.js` is included in the wheel;
- ideally run Python tests against the generated frontend.

### 8. Keep release workflows independent

#### npm

Keep the existing npm/Changesets release flow mostly unchanged. It should publish only the JavaScript package.

#### PyPI

Add or adapt a separate PyPI release workflow. It should:

1. build the widget frontend from local JavaScript;
2. build wheel and sdist;
3. publish only the Python package.

Do not require npm and PyPI versions to match.

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

- Exact location/name for the widget frontend source file before bundling.
- Exact bundler command/configuration for producing the self-contained ESM artifact.
- Exact hatch custom build hook implementation.
- Whether all Python examples/data should be copied immediately or trimmed.
- Whether `uv.lock` can be reused directly after moving `pyproject.toml` to the root.
