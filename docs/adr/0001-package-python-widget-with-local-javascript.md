# Package the Python widget with local JavaScript

The Python widget will use the JavaScript visualization library from the same repository instead of importing a published package from esm.sh. This makes the merged repository meaningful as an integration boundary: CI and releases can verify that the Python widget works with the JavaScript code in the same commit, and PyPI releases can package the matching widget frontend.
