import uchimata as uchi
import numpy as np
import pandas as pd
import pyarrow as pa

def test_numpy_simple():
    positions = [np.array([0.0, 0.0, 0.0]),
                 np.array([1.0, 0.0, 0.0]),
                 np.array([2.0, 0.0, 0.0])]
    structure = np.array(positions)

    vc = {
        "color": "purple",
        "scale": 0.01,
        "links": True,
        "mark": "sphere"
    }
    w = uchi.Widget(structure, viewconfig=vc)
    assert isinstance(w, uchi.Widget)
    assert len(w.structures) == 1
    assert len(w.viewconfigs) == 1
    assert w.viewconfigs[0] == vc

def test_pandas_simple():
    df = pd.DataFrame({"x": [0.0, 1.0, 2.0],
                       "y": [0.0, 0.0, 0.0],
                       "z": [0.0, 0.0, 0.0]})
    vc = {
        "color": "purple",
        "scale": 0.01,
        "links": True,
        "mark": "sphere"
    }
    w = uchi.Widget(df, viewconfig=vc)
    assert isinstance(w, uchi.Widget)
    assert len(w.structures) == 1
    assert len(w.viewconfigs) == 1
    assert w.viewconfigs[0] == vc

def test_arrow_simple():
    x_positions = np.array([0.0, 1.0, 2.0])
    y_positions = np.array([0.0, 0.0, 0.0])
    z_positions = np.array([0.0, 0.0, 0.0])

    pa.array(x_positions)

    table = pa.Table.from_arrays([x_positions, y_positions, z_positions], names=["x", "y", "z"])

    output_stream = pa.BufferOutputStream()
    with pa.ipc.RecordBatchStreamWriter(output_stream, table.schema) as writer:
        writer.write_table(table)

    table_as_bytes = output_stream.getvalue().to_pybytes()

    vc = {
        "color": "purple",
        "scale": 0.01,
        "links": True,
        "mark": "sphere"
    }
    w = uchi.Widget(table_as_bytes, viewconfig=vc)
    assert isinstance(w, uchi.Widget)
    assert len(w.structures) == 1
    assert len(w.viewconfigs) == 1
    assert w.viewconfigs[0] == vc

def test_multiple_structures_same_viewconfig():
    """Test multiple structures with a single viewconfig applied to all"""
    struct1 = np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]])
    struct2 = np.array([[2.0, 0.0, 0.0], [3.0, 0.0, 0.0]])
    struct3 = np.array([[4.0, 0.0, 0.0], [5.0, 0.0, 0.0]])

    vc = {"color": "red", "scale": 0.01}
    w = uchi.Widget(struct1, struct2, struct3, viewconfig=vc)

    assert isinstance(w, uchi.Widget)
    assert len(w.structures) == 3
    assert len(w.viewconfigs) == 3
    # All should have the same viewconfig
    assert all(v == vc for v in w.viewconfigs)

def test_multiple_structures_different_viewconfigs():
    """Test multiple structures with different viewconfigs"""
    struct1 = np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]])
    struct2 = np.array([[2.0, 0.0, 0.0], [3.0, 0.0, 0.0]])

    vc1 = {"color": "red", "scale": 0.01}
    vc2 = {"color": "blue", "scale": 0.02}

    w = uchi.Widget(struct1, struct2, viewconfig=[vc1, vc2])

    assert isinstance(w, uchi.Widget)
    assert len(w.structures) == 2
    assert len(w.viewconfigs) == 2
    assert w.viewconfigs[0] == vc1
    assert w.viewconfigs[1] == vc2

def test_viewconfig_cycling():
    """Test that viewconfigs cycle when there are fewer than structures"""
    struct1 = np.array([[0.0, 0.0, 0.0]])
    struct2 = np.array([[1.0, 0.0, 0.0]])
    struct3 = np.array([[2.0, 0.0, 0.0]])

    vc1 = {"color": "red"}
    vc2 = {"color": "blue"}

    w = uchi.Widget(struct1, struct2, struct3, viewconfig=[vc1, vc2])

    assert isinstance(w, uchi.Widget)
    assert len(w.structures) == 3
    assert len(w.viewconfigs) == 3
    assert w.viewconfigs[0] == vc1
    assert w.viewconfigs[1] == vc2
    assert w.viewconfigs[2] == vc1  # Cycles back

def test_options_parameter():
    """Test the options parameter"""
    structure = np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]])
    options = {"normalize": True, "center": False}

    w = uchi.Widget(structure, options=options)

    assert isinstance(w, uchi.Widget)
    assert w.options == options

def test_options_default():
    """Test that options defaults to empty dict"""
    structure = np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]])

    w = uchi.Widget(structure)

    assert isinstance(w, uchi.Widget)
    assert w.options == {}
