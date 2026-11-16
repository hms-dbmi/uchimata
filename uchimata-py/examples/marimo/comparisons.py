import marimo

__generated_with = "0.15.2"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    import requests
    import uchimata as uchi
    return mo, requests, uchi


@app.cell
def _():
    vc1 = {
        "color": {
            "field": "chr",
            "colorScale": "Spectral",
        },
        "links": True,
    }
    return (vc1,)


@app.cell
def _(mo):
    mo.md(r"""The following cells show different models from `Stevens et al. 2017` publication:""")
    return


@app.cell
def _(model, uchi, vc1):
    uchi.Widget(model, viewconfig=vc1)
    return


@app.cell
def _(model2, uchi, vc1):
    uchi.Widget(model2, viewconfig=vc1)
    return


@app.cell
def _(model3, uchi, vc1):
    uchi.Widget(model3, viewconfig=vc1)
    return


@app.cell
def _(model4, uchi):
    w4 = uchi.Widget(uchi.select(model4, "chr f"), viewconfig={"color": "crimson", "links": True})
    return (w4,)


@app.cell
def _(model5, uchi):
    w5 = uchi.Widget(uchi.select(model5, "chr f"), viewconfig={"color": "mediumseagreen", "links": True})
    return (w5,)


@app.cell
def _(mo, w4, w5):
    mo.hstack([w4, w5], widths="equal")
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

    model2 = fetchFile("https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_2.arrow")
    model3 = fetchFile("https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_3.arrow")
    model4 = fetchFile("https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_4.arrow")
    model5 = fetchFile("https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow")
    return model, model2, model3, model4, model5


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
