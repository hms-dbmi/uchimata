"""
Uchimata: A widget for visualizing 3D chromatin structures in computational notebooks.

This package provides an anywidget-based interface for visualizing 3D genome models
in Python notebooks (Jupyter, Marimo, etc.). It supports various input formats including
numpy arrays, pandas DataFrames, and Apache Arrow, with the ability to query and filter
genomic regions using bioframe.

The main class is Widget, which displays 3D chromatin structures with customizable
visual configurations.

Example:
    >>> import uchimata as uchi
    >>> import numpy as np
    >>> structure = np.random.rand(1000, 3)  # 1000 points in 3D
    >>> uchi.Widget(structure, viewconfig={'color': 'red', 'scale': 0.01})
"""

import importlib.metadata
import pathlib

import anywidget
import traitlets

import numpy as np
import pandas as pd
import pyarrow as pa

import duckdb
import re
import bioframe

try:
    __version__ = importlib.metadata.version("uchimata")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"

def select_bioframe(model, df):
    """
    Select genomic regions from a 3D structure using a bioframe bedframe.

    Filters a 3D chromatin structure to include only the genomic regions specified
    in a bioframe-compatible DataFrame (must have 'chrom', 'start', 'end' columns).
    This is useful for extracting specific genomic loci or ranges from a larger structure.

    Args:
        model (bytes): Apache Arrow IPC file bytes containing the 3D structure data.
            The structure table should have 'chr' and 'coord' columns for genomic positions.
        df (pd.DataFrame): A bioframe-compatible DataFrame with 'chrom', 'start', and 'end'
            columns defining the genomic regions to select.

    Returns:
        bytes: Apache Arrow IPC stream bytes containing only the selected regions.

    Raises:
        ValueError: If df is not a valid bedframe (missing required columns).

    Example:
        >>> import pandas as pd
        >>> import bioframe
        >>> regions = pd.DataFrame({
        ...     'chrom': ['chr1', 'chr2'],
        ...     'start': [1000, 5000],
        ...     'end': [2000, 6000]
        ... })
        >>> filtered_model = select_bioframe(model_bytes, regions)
    """
    # convert arrow Bytes to Table
    reader = pa.ipc.open_file(model)
    struct_table = reader.read_all()

    if not bioframe.is_bedframe(df):
        # This makes sure that there are 'chrom', 'start', 'end' columns in the dataframe
        raise ValueError("DataFrame is not a valid bedframe.")

    sqlQuery = f'SELECT * FROM struct_table WHERE '
    for index, row in df.iterrows():
        chrom = row['chrom']
        start = row['start']
        end = row['end']
        if index > 0:
            sqlQuery += ' OR '
        sqlQuery += f'(chr = \'{chrom}\' AND coord >= {start} AND coord <= {end})'

    con = duckdb.connect()
    new_table = con.execute(sqlQuery).arrow()
    sink = pa.BufferOutputStream()
    writer = pa.ipc.new_stream(sink, new_table.schema)
    writer.write_table(new_table)
    writer.close()

    # Get the bytes
    arrow_bytes = sink.getvalue().to_pybytes()
    return arrow_bytes

def cut(model):
    """
    Filter a 3D structure to include only points with positive x coordinates.

    This function performs a simple spatial filter on a 3D chromatin structure,
    keeping only the points where the x coordinate is greater than 0. This can be
    useful for visualizing half of a structure or removing points on one side of
    a plane.

    Args:
        model (bytes): Apache Arrow IPC stream bytes containing the 3D structure data.
            The structure table must have an 'x' column for x coordinates.

    Returns:
        bytes: Apache Arrow IPC stream bytes containing only points where x > 0.

    Example:
        >>> filtered_model = cut(model_bytes)
        >>> # Display only the positive-x half of the structure
        >>> Widget(filtered_model)
    """
    # convert arrow Bytes to Table
    buf = pa.BufferReader(model)
    reader = pa.ipc.RecordBatchStreamReader(buf)

    # table = reader.read_all()
    struct_table = reader.read_all()

    sqlQuery = f'SELECT * FROM struct_table WHERE x > 0'
    
    con = duckdb.connect()
    new_table = con.execute(sqlQuery).arrow()
    sink = pa.BufferOutputStream()
    writer = pa.ipc.new_stream(sink, new_table.schema)
    writer.write_table(new_table)
    writer.close()

    # Get the bytes
    arrow_bytes = sink.getvalue().to_pybytes()
    return arrow_bytes

def select(_model, _query):
    """
    Select a genomic region from a 3D structure using a query string.

    Extracts a subset of a 3D chromatin structure based on chromosome name and/or
    genomic coordinates. The query can specify either a whole chromosome or a
    specific range within a chromosome.

    Args:
        _model (bytes): Apache Arrow IPC file bytes containing the 3D structure data.
            The structure table must have 'chr' and 'coord' columns for genomic positions.
        _query (str): Query string in one of two formats:
            - Chromosome only: "chr1" (selects entire chromosome)
            - Chromosome with range: "chr1:1000-2000" (selects coordinate range)

    Returns:
        bytes: Apache Arrow IPC stream bytes containing only the selected region.

    Example:
        >>> # Select entire chromosome 1
        >>> chr1_model = select(model_bytes, "chr1")
        >>>
        >>> # Select a specific range on chromosome 2
        >>> region_model = select(model_bytes, "chr2:5000-10000")
        >>> Widget(region_model)
    """
    # convert arrow Bytes to Table
    reader = pa.ipc.open_file(_model)
    struct_table = reader.read_all()
    # separate query into "chromosome:starCoord-endCoord"
    if ":" in _query:
        # means it should have a start-end range
        match = re.match(r"([^\:]+):(\d+)-(\d+)", _query)
        if match:
            chrom, start, end = match.groups()
            sqlQuery = f'SELECT * FROM struct_table WHERE chr = \'{chrom}\' AND coord >= {start} AND coord <= {end}'
        else:
            print("Pattern does not match.")
            return
    else:
        # otherwise let's assume that it's a chromosome name
        sqlQuery = f'SELECT * FROM struct_table WHERE chr = \'{_query}\''

    con = duckdb.connect()
    new_table = con.execute(sqlQuery).arrow()
    sink = pa.BufferOutputStream()
    writer = pa.ipc.new_stream(sink, new_table.schema)
    writer.write_table(new_table)
    writer.close()

    # Get the bytes
    arrow_bytes = sink.getvalue().to_pybytes()
    return arrow_bytes

    # vc2 = {
    #     "color": "lightgreen",
    #     "scale": 0.01, 
    #     "links": True, 
    #     "mark": "sphere"
    # }
    #
    # return Widget(structure=arrow_bytes, viewconfig=vc2)

def from_numpy(nparr):
    """
    Convert a numpy array of 3D coordinates to Apache Arrow bytes.

    Takes a 2D numpy array where each row represents a point in 3D space with
    [x, y, z] coordinates, and converts it to Apache Arrow IPC stream bytes
    suitable for use with the Widget class.

    Args:
        nparr (np.ndarray): A 2D numpy array with shape (n, 3) where n is the
            number of points. Each row should contain [x, y, z] coordinates.
            The array will be converted to float32 precision.

    Returns:
        bytes: Apache Arrow IPC stream bytes containing the structure data.

    Example:
        >>> import numpy as np
        >>> # Create a random 3D chromatin structure with 1000 points
        >>> structure = np.random.rand(1000, 3)
        >>> arrow_bytes = from_numpy(structure)
        >>> Widget(arrow_bytes)
    """
    xyz = nparr.astype(np.float32)
    # Convert numpy array to pandas dataframe
    xyzDF = pd.DataFrame({'x': xyz[:, 0], 'y': xyz[:, 1], 'z': xyz[:, 2]})

    return from_pandas_dataframe(xyzDF)

def from_pandas_dataframe(df):
    """
    Convert a pandas DataFrame to Apache Arrow bytes.

    Takes a pandas DataFrame containing 3D coordinates (with 'x', 'y', 'z' columns)
    and converts it to Apache Arrow IPC stream bytes suitable for use with the
    Widget class. This function is used internally by from_numpy and Widget.__init__.

    Args:
        df (pd.DataFrame): A pandas DataFrame with columns 'x', 'y', and 'z'
            representing 3D coordinates. May also include other columns for
            genomic metadata (e.g., 'chr', 'coord').

    Returns:
        bytes: Apache Arrow IPC stream bytes containing the DataFrame data.

    Example:
        >>> import pandas as pd
        >>> df = pd.DataFrame({
        ...     'x': [1.0, 2.0, 3.0],
        ...     'y': [4.0, 5.0, 6.0],
        ...     'z': [7.0, 8.0, 9.0]
        ... })
        >>> arrow_bytes = from_pandas_dataframe(df)
        >>> Widget(arrow_bytes)
    """
    # Convert pandas DF to Arrow Table
    xyzArrowTable = pa.Table.from_pandas(df)
    # Convert the Table to bytes
    output_stream = pa.BufferOutputStream()
    with pa.ipc.RecordBatchStreamWriter(output_stream, xyzArrowTable.schema) as writer:
        writer.write_table(xyzArrowTable)

    # Get the table as Bytes
    table_bytes = output_stream.getvalue().to_pybytes()
    return table_bytes

class Widget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"

    # 3D structure input: assumes Apache Arrow format
    structures = traitlets.List().tag(sync=True)
    # ViewConfig: defines how the 3D structure will be shown
    viewconfigs = traitlets.List().tag(sync=True)

    # options
    options = traitlets.Dict().tag(sync=True)

    def __init__(self, *structures, viewconfig=None, options=None):
        """
        Create a widget with one or more 3D structures.

        Args:
            *structures: One or more structure inputs. Each can be:
                - 2D numpy array: [[x, y, z], ...]
                - pandas dataframe: columns need to be 'x', 'y', 'z'
                - Apache Arrow bytes
            viewconfig: Optional viewconfig(s). Can be:
                - None: uses default empty viewconfig for all structures
                - dict: same viewconfig applied to all structures
                - list of dicts: each structure gets corresponding viewconfig
                  (if fewer viewconfigs than structures, cycles through them)
            options: Optional dict with display options. Supported fields:
                - normalize: bool, whether to normalize coordinates
                - center: bool, whether to center the structure

        Examples:
            Widget(structure1)
            Widget(structure1, viewconfig={'color': 'red'})
            Widget(structure1, structure2, structure3)
            Widget(structure1, structure2, viewconfig={'color': 'red'})
            Widget(s1, s2, s3, viewconfig=[vc1, vc2, vc3])
            Widget(s1, s2, s3, viewconfig=[vc1])  # vc1 used for all three
            Widget(structure1, options={'normalize': True, 'center': False})
        """
        if not structures:
            raise ValueError("At least one structure must be provided")

        # Normalize viewconfig to a list
        if viewconfig is None:
            viewconfigs_list = [{}]
        elif isinstance(viewconfig, dict):
            viewconfigs_list = [viewconfig]
        else:
            viewconfigs_list = list(viewconfig)

        # Handle options default
        if options is None:
            options = {}

        # Convert all structures to Arrow bytes
        processed_structures = []
        for structure in structures:
            if isinstance(structure, np.ndarray):
                processed_structures.append(from_numpy(structure))
            elif isinstance(structure, pd.DataFrame):
                processed_structures.append(from_pandas_dataframe(structure))
            else:
                # Assume Arrow as Bytes
                processed_structures.append(structure)

        # Match structures with viewconfigs (cycle through viewconfigs if needed)
        matched_viewconfigs = []
        for i in range(len(processed_structures)):
            # Cycle through viewconfigs if there are fewer than structures
            vc_index = i % len(viewconfigs_list)
            matched_viewconfigs.append(viewconfigs_list[vc_index])

        super().__init__(structures=processed_structures, viewconfigs=matched_viewconfigs, options=options)

