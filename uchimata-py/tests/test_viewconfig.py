import uchimata as uchi
import numpy as np
import pyarrow as pa

def test_no_viewconfig_supplied():
    """Test that widget works without viewconfig (uses default empty dict)"""
    positions = [np.array([0.0, 0.0, 0.0]),
                 np.array([1.0, 0.0, 0.0]),
                 np.array([2.0, 0.0, 0.0])]
    structure = np.array(positions)

    w = uchi.Widget(structure)
    assert isinstance(w, uchi.Widget)
    assert len(w.structures) == 1
    assert len(w.viewconfigs) == 1
    assert w.viewconfigs[0] == {}

def test_multiple_structures_no_viewconfig():
    """Test multiple structures with no viewconfig (all use default empty dict)"""
    struct1 = np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]])
    struct2 = np.array([[2.0, 0.0, 0.0], [3.0, 0.0, 0.0]])

    w = uchi.Widget(struct1, struct2)
    assert isinstance(w, uchi.Widget)
    assert len(w.structures) == 2
    assert len(w.viewconfigs) == 2
    assert all(v == {} for v in w.viewconfigs)
