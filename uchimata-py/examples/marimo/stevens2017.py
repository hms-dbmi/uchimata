import marimo

__generated_with = "0.15.2"
app = marimo.App(width="medium")


@app.cell
def _():
    import uchimata as uchi
    import requests
    return requests, uchi


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
    return (fetchFile,)


@app.cell
def _(fetchFile):
    model1 = fetchFile("https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_1.arrow")
    model2 = fetchFile("https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219498_Cell_2_model_1.arrow")
    model3 = fetchFile("https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219499_Cell_3_model_1.arrow")
    return model1, model2, model3


@app.cell
def _(model1, uchi):
    vc = {
        "color": {
            "field": "coord",
            "min": 3000000,
            "max": 200000000,
            "colorScale": "BuGn"
        }, 
        "scale": 0.005, "links": True, "mark": "sphere"
    }

    uchi.Widget(model1, viewconfig=vc)
    return (vc,)


@app.cell
def _(model2, uchi, vc):
    uchi.Widget(model2, viewconfig=vc)
    return


@app.cell
def _(model3, uchi, vc):
    uchi.Widget(model3, viewconfig=vc)
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
