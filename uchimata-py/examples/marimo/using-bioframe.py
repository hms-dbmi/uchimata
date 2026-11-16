import marimo

__generated_with = "0.15.2"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
    # Mapping gene density to a 3D genome structure
    In this example, we'll map gene density to a 3D structure model. Thanks to `marimo`, we can skip directly to the end and show the final visualization before breaking down the process. Below, you can see a 3D structure of a mouse genome. The density of genes is mapped to both color and size of the spherical marks representing bins. The structure is cut in half. The bigger and darker spheres represent regions of the genome where many genes lie.
    """
    )
    return


@app.cell
def _(merged_table_bytes, uchi):
    vc = {
        "color": {
            "field": "count",
            "min": 0,
            "max": 395,
            "colorScale": "Blues"
        }, 
        "scale": {
            "field": "count",
            "min": 0,
            "max": 395,
            "scaleMin": 0.001,
            "scaleMax": 0.02,
        }, 
        "links": False, "mark": "sphere"
    }

    cutModel = uchi.cut(merged_table_bytes)
    # w3 = uchi.Widget(structure=merged_table_bytes, viewconfig=vc)
    w3 = uchi.Widget(cutModel, viewconfig=vc)
    w3
    return cutModel, w3


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## Getting the gene annotation data
    We'll fetch and process gene annotations for the 'mm10' assembly, since that is what our 3D structures use. We're using `bioframe` to download and process the data.
    """
    )
    return


@app.cell
def _(bioframe):
    assembly_mouse = "mm10"
    chromsizes_mouse = bioframe.fetch_chromsizes(assembly_mouse)
    # chromsizes_mouse
    return (chromsizes_mouse,)


@app.cell
def _(bioframe):
    # taken from here: https://www.encodeproject.org/files/ENCFF871VGR/
    mouse_genes_url = "https://www.encodeproject.org/files/ENCFF871VGR/@@download/ENCFF871VGR.gtf.gz"
    mouse_genes = bioframe.read_table(mouse_genes_url, schema="gtf").query('feature=="CDS"')
    mouse_genes
    return (mouse_genes,)


@app.cell
def _(bioframe, chromsizes_mouse, mouse_genes):
    bins = bioframe.binnify(chromsizes_mouse, 100_000)

    bin_gene_counts = bioframe.count_overlaps(bins, mouse_genes)
    bin_gene_counts
    return (bin_gene_counts,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## Process the 3D structures
    The structures have been published in a format that requires some processing before we can merge / join them with a bedfile-like columnar format.
    """
    )
    return


@app.cell
def _(fetchFile):
    # The origin of this data is [Stevens et al. 2017](https://doi.org/10.1038/nature21429). The supplementals stored at GEO have been processed and individual structures extracted from the PDB files.
    url = "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_1.arrow"
    model = fetchFile(url)
    return (model,)


@app.cell
def _(ipc, model, pa):
    # Converting the Arrow IPC bytes to Arrow Table and then a pandas dataframe
    buf = pa.BufferReader(model)
    reader = ipc.RecordBatchFileReader(buf)

    table = reader.read_all()
    table_as_df = table.to_pandas()
    table_as_df
    return (table_as_df,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""Next, we need to process the 3D structure dataframe:""")
    return


@app.cell
def _(table_as_df):
    # 1. rename 'chr a' to 'chr1' etc.
    table_df = table_as_df.copy()
    mapping = {
        'chr a': 'chr1',
        'chr b': 'chr2',
        'chr c': 'chr3',
        'chr d': 'chr4',
        'chr e': 'chr5',
        'chr f': 'chr6',
        'chr g': 'chr7',
        'chr h': 'chr8',
        'chr i': 'chr9',
        'chr j': 'chr10',
        'chr k': 'chr11',
        'chr l': 'chr12',
        'chr m': 'chr13',
        'chr n': 'chr14',
        'chr o': 'chr15',
        'chr p': 'chr16',
        'chr q': 'chr17',
        'chr r': 'chr18',
        'chr s': 'chr19',
        # 'chr a': 'chrX',
    }
    table_df['chr'] = table_df['chr'].map(mapping).fillna(table_df['chr'])

    # 2. add 'end' column, based on the binning resolution of the model
    table_df['end'] = table_df['coord'] + 100_000

    # 3. rename 'coord' to 'start'
    table_df = table_df.rename(columns={'coord': 'start'})

    # 4. rename 'chr' to 'chrom'
    table_df = table_df.rename(columns={'chr': 'chrom'})

    table_df
    return (table_df,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""## Joining the gene density and structure dataframes""")
    return


@app.cell
def _(bin_gene_counts, pd, table_df):
    merged_df = pd.merge(table_df, bin_gene_counts, on=["chrom", "start", "end"], how="inner")
    merged_df
    return (merged_df,)


@app.cell
def _(merged_df, pa):
    merged_table = pa.Table.from_pandas(merged_df)
    # xyzArrowTable = pa.Table.from_pandas(df)
    # Convert the Table to bytes
    output_stream = pa.BufferOutputStream()
    with pa.ipc.RecordBatchStreamWriter(output_stream, merged_table.schema) as writer:
        writer.write_table(merged_table)

    # Get the table as Bytes
    merged_table_bytes = output_stream.getvalue().to_pybytes()

    # merged_table # this actually shouldn't really be needed, because I can just directly feed the pandas DF to uchimata widget
    return (merged_table_bytes,)


@app.cell
def _(mo):
    mo.md(
        r"""
    ## The result
    Extracting biological insights is, of course, on a bioinformatician to do, but we can for example see the gene-rich regions and more concentrated "inside" the structure.
    """
    )
    return


@app.cell
def _(merged_table_bytes, uchi):
    vc4 = {
        "color": {
            "field": "count",
            "min": 0,
            "max": 395,
            "colorScale": "Viridis"
        }, 
        "scale": 0.01, "links": False, "mark": "sphere"
    }

    # cutModel = uchi.cut(merged_table_bytes)
    w4 = uchi.Widget(merged_table_bytes, viewconfig=vc4)
    # w3 = uchi.Widget(structure=cutModel, viewconfig=vc)
    w4
    return


@app.cell
def _(cutModel, uchi):
    vc5 = {
        "color": {
            "field": "count",
            "min": 0,
            "max": 395,
            "colorScale": "Blues"
        }, 
        "scale": 0.01, "links": False, "mark": "sphere"
    }

    # cutModel2 = uchi.cut(merged_table_bytes)
    w5 = uchi.Widget(cutModel, viewconfig=vc5)
    w5
    return


@app.cell
def _(w3):
    w3
    return


@app.cell
def _(merged_table_bytes, uchi):
    vc6 = {
        "color": {
            "field": "count",
            "min": 0,
            "max": 395,
            "colorScale": "Viridis"
        }, 
        "scale": 0.01, "links": False, "mark": "sphere"
    }

    # cutModel2 = uchi.cut(merged_table_bytes)
    uchi.Widget(uchi.select(merged_table_bytes, "chr f"), viewconfig=vc6)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""## Appendix""")
    return


@app.cell
def _():
    import numpy as np
    import bioframe
    import uchimata as uchi
    import requests
    import marimo as mo
    return bioframe, mo, requests, uchi


@app.cell
def _():
    import pyarrow as pa
    import pyarrow.ipc as ipc
    import pandas as pd
    return ipc, pa, pd


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
    url2 = "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_2.arrow"
    model2 = fetchFile(url2)
    return


if __name__ == "__main__":
    app.run()
