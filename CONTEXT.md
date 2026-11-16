# Uchimata

Uchimata is a visualization tool for 3D chromatin structures, available through multiple entrypoints for different computational environments.

## Language

**Uchimata tool**:
The single product that provides visualization of 3D chromatin structures across supported usage environments.
_Avoid_: JS project and Python project as separate products

**Entrypoint**:
A supported way for users to access the Uchimata tool, such as the JavaScript library or the Python widget.
_Avoid_: Separate product, wrapper when referring to the product boundary

**JavaScript visualization library**:
The Uchimata entrypoint for web and JavaScript environments, and the implementation that defines rendering behavior.
_Avoid_: Frontend asset, bundled script when referring to the public entrypoint

**Python widget**:
The Uchimata entrypoint for Python notebook environments, providing a Python interface to the JavaScript visualization library.
_Avoid_: Separate product

**Widget frontend**:
The JavaScript module embedded in the Python widget that connects notebook state to the JavaScript visualization library.
_Avoid_: esm.sh integration, CDN widget code
