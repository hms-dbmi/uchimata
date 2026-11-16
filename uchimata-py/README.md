# uchimata-py

This repository contains code for a widget version of the
[uchimata](https://github.com/hms-dbmi/uchimata) library. Made with
[anywidget](https://github.com/manzt/anywidget), this allows people to
visualize 3D genome models in Python-based computational notebooks, such as
Jupyter Notebook.

<img width="2384" height="2250" alt="colorful squiggly thick line depicting 3D chromatin running in jupyter
notebook" src="https://github.com/user-attachments/assets/724f2a75-34a1-489e-abe8-f8167fdbd3cc" />


## Basic usage

`uchimata` is available on [PyPI](https://pypi.org/project/uchimata/):

```
pip install uchimata
```

We like to use [uv](https://docs.astral.sh/uv/) to manage project dependencies:

```
uv add uchimata
```

```python
import uchimata as uchi
import numpy as np

BINS_NUM = 1000

# Step 1: Generate random structure, returns a 2D numpy array:
def make_random_3D_chromatin_structure(n):
    position = np.array([0.0, 0.0, 0.0])
    positions = [position.copy()]
    for _ in range(n):
        step = np.random.choice([-1.0, 0.0, 1.0], size=3)  # Randomly choose to move left, right, up, down, forward, or backward
        position += step
        positions.append(position.copy())
    return np.array(positions)

random_structure = make_random_3D_chromatin_structure(BINS_NUM)

# Step 2: Display the structure in an uchimata widget
numbers = list(range(0, BINS_NUM+1))
vc = {
    "color": {
        "values": numbers,
        "min": 0,
        "max": BINS_NUM,
        "colorScale": "Spectral"
    }, 
    "scale": 0.01, 
    "links": True, 
    "mark": "sphere"
}
uchi.Widget(random_structure, vc)
```
[Run the example in Google
Colab](https://colab.research.google.com/drive/1EZh9HcGS3cgPF4C6eFyMm5iHGVGS4Cj_?usp=sharing).

The API is still frequently changing. The main feature of the widget right now
is the ability to display 3D chromatin models and we're working on capabilities
to integrate with other bioinformatics tools.

The underlying JS library [only supports data in the Apache Arrow
format](https://hms-dbmi.github.io/uchimata/why-arrow.html).

In the widget version, on the other hand, we provide interface to load data in
many notebook-native formats, such as 2D numpy arrays, or pandas dataframe
(with columns named `'x'`, `'y'`, `'z'`).

Quickly test out **uchimata** with [uv](https://docs.astral.sh/uv/):
1. `uv run --with uchimata --with numpy --with pyarrow --with jupyterlab
   jupyter lab`
2. make a new notebook
3. copy and paste the code above into an empty cell

## Contributing
Running tests:
`uv run pytest`
