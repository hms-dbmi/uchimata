# Keep JavaScript and Python package versions independent

Uchimata is one product with JavaScript and Python entrypoints, but the npm and PyPI packages will keep independent version numbers. The Python widget depends on the JavaScript visualization API, so compatibility is still required, but independent versions allow ecosystem-specific releases instead of forcing every npm release and PyPI release to happen in lockstep.
