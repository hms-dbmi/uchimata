# Uchimata API Reference

This document provides a complete API reference for the `uchimata` package.

## Overview

Uchimata is a widget for visualizing 3D chromatin structures in computational notebooks. It provides an anywidget-based interface for visualizing 3D genome models in Python notebooks (Jupyter, Marimo, etc.). It supports various input formats including numpy arrays, pandas DataFrames, and Apache Arrow, with the ability to query and filter genomic regions using bioframe.

## Installation

```bash
pip install uchimata
```

or with uv:

```bash
uv add uchimata
```

## Quick Start

```python
import uchimata as uchi
import numpy as np

# Create a random 3D structure
structure = np.random.rand(1000, 3)

# Display it in a widget
uchi.Widget(structure, viewconfig={'color': 'red', 'scale': 0.01})
```

---

## Classes

### Widget

```python
Widget(*structures, viewconfig=None, options=None)
```

Create a widget with one or more 3D chromatin structures.

**Parameters:**

- `*structures`: One or more structure inputs. Each can be:
  - 2D numpy array: `[[x, y, z], ...]`
  - pandas DataFrame: columns need to be 'x', 'y', 'z'
  - Apache Arrow bytes

- `viewconfig` (optional): Viewconfig(s) to control visualization. Can be:
  - `None`: uses default empty viewconfig for all structures
  - `dict`: same viewconfig applied to all structures
  - `list` of dicts: each structure gets corresponding viewconfig (if fewer viewconfigs than structures, cycles through them)

- `options` (optional): Dict with display options. Supported fields:
  - `normalize`: bool, whether to normalize coordinates
  - `center`: bool, whether to center the structure

**Examples:**

```python
# Single structure with custom viewconfig
Widget(structure1, viewconfig={'color': 'red'})

# Multiple structures
Widget(structure1, structure2, structure3)

# Multiple structures with shared viewconfig
Widget(structure1, structure2, viewconfig={'color': 'red'})

# Multiple structures with individual viewconfigs
Widget(s1, s2, s3, viewconfig=[vc1, vc2, vc3])

# With options
Widget(structure1, options={'normalize': True, 'center': False})
```

**Attributes:**

- `structures`: List of structures in Apache Arrow format (synced with frontend)
- `viewconfigs`: List of viewconfig dictionaries (synced with frontend)
- `options`: Dictionary of display options (synced with frontend)

---

## Functions

### from_numpy

```python
from_numpy(nparr)
```

Convert a numpy array of 3D coordinates to Apache Arrow bytes.

Takes a 2D numpy array where each row represents a point in 3D space with [x, y, z] coordinates, and converts it to Apache Arrow IPC stream bytes suitable for use with the Widget class.

**Parameters:**

- `nparr` (np.ndarray): A 2D numpy array with shape (n, 3) where n is the number of points. Each row should contain [x, y, z] coordinates. The array will be converted to float32 precision.

**Returns:**

- `bytes`: Apache Arrow IPC stream bytes containing the structure data.

**Example:**

```python
import numpy as np

# Create a random 3D chromatin structure with 1000 points
structure = np.random.rand(1000, 3)
arrow_bytes = from_numpy(structure)
Widget(arrow_bytes)
```

---

### from_pandas_dataframe

```python
from_pandas_dataframe(df)
```

Convert a pandas DataFrame to Apache Arrow bytes.

Takes a pandas DataFrame containing 3D coordinates (with 'x', 'y', 'z' columns) and converts it to Apache Arrow IPC stream bytes suitable for use with the Widget class. This function is used internally by `from_numpy` and `Widget.__init__`.

**Parameters:**

- `df` (pd.DataFrame): A pandas DataFrame with columns 'x', 'y', and 'z' representing 3D coordinates. May also include other columns for genomic metadata (e.g., 'chr', 'coord').

**Returns:**

- `bytes`: Apache Arrow IPC stream bytes containing the DataFrame data.

**Example:**

```python
import pandas as pd

df = pd.DataFrame({
    'x': [1.0, 2.0, 3.0],
    'y': [4.0, 5.0, 6.0],
    'z': [7.0, 8.0, 9.0]
})
arrow_bytes = from_pandas_dataframe(df)
Widget(arrow_bytes)
```

---

### select

```python
select(model, query)
```

Select a genomic region from a 3D structure using a query string.

Extracts a subset of a 3D chromatin structure based on chromosome name and/or genomic coordinates. The query can specify either a whole chromosome or a specific range within a chromosome.

**Parameters:**

- `model` (bytes): Apache Arrow IPC file bytes containing the 3D structure data. The structure table must have 'chr' and 'coord' columns for genomic positions.

- `query` (str): Query string in one of two formats:
  - Chromosome only: `"chr1"` (selects entire chromosome)
  - Chromosome with range: `"chr1:1000-2000"` (selects coordinate range)

**Returns:**

- `bytes`: Apache Arrow IPC stream bytes containing only the selected region.

**Example:**

```python
# Select entire chromosome 1
chr1_model = select(model_bytes, "chr1")

# Select a specific range on chromosome 2
region_model = select(model_bytes, "chr2:5000-10000")
Widget(region_model)
```

---

### select_bioframe

```python
select_bioframe(model, df)
```

Select genomic regions from a 3D structure using a bioframe bedframe.

Filters a 3D chromatin structure to include only the genomic regions specified in a bioframe-compatible DataFrame (must have 'chrom', 'start', 'end' columns). This is useful for extracting specific genomic loci or ranges from a larger structure.

**Parameters:**

- `model` (bytes): Apache Arrow IPC file bytes containing the 3D structure data. The structure table should have 'chr' and 'coord' columns for genomic positions.

- `df` (pd.DataFrame): A bioframe-compatible DataFrame with 'chrom', 'start', and 'end' columns defining the genomic regions to select.

**Returns:**

- `bytes`: Apache Arrow IPC stream bytes containing only the selected regions.

**Raises:**

- `ValueError`: If df is not a valid bedframe (missing required columns).

**Example:**

```python
import pandas as pd
import bioframe

regions = pd.DataFrame({
    'chrom': ['chr1', 'chr2'],
    'start': [1000, 5000],
    'end': [2000, 6000]
})
filtered_model = select_bioframe(model_bytes, regions)
Widget(filtered_model)
```

---

### cut

```python
cut(model)
```

Filter a 3D structure to include only points with positive x coordinates.

This function performs a simple spatial filter on a 3D chromatin structure, keeping only the points where the x coordinate is greater than 0. This can be useful for visualizing half of a structure or removing points on one side of a plane.

**Parameters:**

- `model` (bytes): Apache Arrow IPC stream bytes containing the 3D structure data. The structure table must have an 'x' column for x coordinates.

**Returns:**

- `bytes`: Apache Arrow IPC stream bytes containing only points where x > 0.

**Example:**

```python
filtered_model = cut(model_bytes)
# Display only the positive-x half of the structure
Widget(filtered_model)
```

---

## ViewConfig Reference

The `viewconfig` parameter controls how structures are visualized. It's a dictionary that can contain:

- `color`: Color specification
  - String: color name (e.g., `"red"`, `"lightgreen"`)
  - Dict with:
    - `values`: Array of values for coloring
    - `min`: Minimum value for color scale
    - `max`: Maximum value for color scale
    - `colorScale`: Name of color scale (e.g., `"Spectral"`)

- `scale`: Float, scaling factor for visualization (e.g., `0.01`)

- `links`: Boolean, whether to show links between consecutive points

- `mark`: String, visualization mark type (e.g., `"sphere"`)

**Example:**

```python
viewconfig = {
    "color": {
        "values": list(range(1000)),
        "min": 0,
        "max": 1000,
        "colorScale": "Spectral"
    },
    "scale": 0.01,
    "links": True,
    "mark": "sphere"
}
```

---

## Version

```python
__version__
```

The current version of the uchimata package.
