import marimo

__generated_with = "0.15.2"
app = marimo.App(width="medium")


@app.cell
def _():
    import uchimata as uchi
    import numpy as np
    return np, uchi


@app.cell
def _(make_random_3D_chromatin_structure, uchi):
    # Step 1: Generate random structure, returns a 2D numpy array:
    BINS_NUM = 1000
    random_structure = make_random_3D_chromatin_structure(BINS_NUM)
    numbers = list(range(0, BINS_NUM+1))

    # Step 2: Define a view configuration
    vc = {
        "color": {
            "values": numbers,
            "min": 0,
            "max": BINS_NUM+1,
            "colorScale": "Spectral"
        }, 
        "scale": 0.01, "links": True, "mark": "sphere"
    }

    # Step 3: Display the structure in a uchimata widget
    uchi.Widget(random_structure, viewconfig=vc)
    return


@app.cell
def _(np):
    def make_random_3D_chromatin_structure(n):
        position = np.array([0.0, 0.0, 0.0])
        positions = [position.copy()]
        for _ in range(n):
            # Randomly choose to move left, right, up, down, forward, or backward
            step = np.random.choice([-1.0, 0.0, 1.0], size=3)
            position += step
            positions.append(position.copy())
        return np.array(positions)
    return (make_random_3D_chromatin_structure,)


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
