import marimo

__generated_with = "0.15.2"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    import requests
    import bioframe
    import uchimata as uchi
    return bioframe, mo, requests, uchi


@app.cell
def _(model, uchi):
    vc1 = {
        "color": {
            "field": "chr",
            "colorScale": "Spectral",
        },
        "links": True,
    }

    w1 = uchi.Widget(model, viewconfig=vc1)
    w1
    return (vc1,)


@app.cell
def _(model, uchi):
    # Selecting via chromosome names
    model_chr1 = uchi.select(model, "chr a")
    w3 = uchi.Widget(model_chr1, viewconfig={"color": "crimson", "links": True})
    w3
    return


@app.cell
def _(bioframe, model, uchi, vc1):
    ## Using a dataframe created via `bioframe`

    # The chromosome names ("chr a", "chr b") might seen unusual, but it is simply taken verbatim from what the authors store in the PDB with the publication
    df3 = bioframe.from_any(
        [['chr a', 3000000, 5000000],
         ['chr b', 3000000, 5000000]],
        name_col='chrom')

    submodel = uchi.select_bioframe(model, df3)
    w2 = uchi.Widget(submodel, viewconfig=vc1)
    w2
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""## Data download""")
    return


@app.cell
def _(requests):
    def fetchFile(url):
        response = requests.get(url)
        if (response.status_code == 200):
            file = response.content
            return file
        else:
            print("Error fetching the remote file")
            return None

    # The origin of this data is [Stevens et al. 2017](https://doi.org/10.1038/nature21429). The supplementals stored at GEO have been processed and individual structures extracted from the PDB files.
    url = "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_1.arrow"
    model = fetchFile(url)
    return (model,)


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
