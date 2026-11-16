import marimo

__generated_with = "0.15.2"
app = marimo.App(width="medium")


@app.cell
def _():
    import bioframe
    return (bioframe,)


@app.cell
def _(bioframe):
    # taken from here: https://www.encodeproject.org/files/ENCFF871VGR/
    mouse_genes_url = "https://www.encodeproject.org/files/ENCFF871VGR/@@download/ENCFF871VGR.gtf.gz"
    mouse_genes = bioframe.read_table(mouse_genes_url, schema="gtf").query('feature=="CDS"')
    mouse_genes
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
