import marimo

__generated_with = "0.15.2"
app = marimo.App(width="medium")


@app.cell
def _(fetchFile):
    url = "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Tan-2018_GSM3271347_gm12878_01.arrow"
    model = fetchFile(url)
    return (model,)


@app.cell
def _(pd):
    compartments_file = "./sample_data/all_subcompt_merged_example.csv"
    compartments_df_orig = pd.read_csv(compartments_file)
    compartments_df_orig

    # processing
    compartments_df = compartments_df_orig.copy()
    compartments_df = compartments_df.rename(columns={'chr': 'chrom', 'pos_start': 'start', 'pos_end': 'end'})

    compartments_df = compartments_df.iloc[::10]
    compartments_df['start'] = compartments_df['start'] - 1
    compartments_df['end'] = compartments_df['start'] + 100_000

    compartments_df
    return (compartments_df,)


@app.cell
def _(bioframe):
    chromsizes = bioframe.fetch_chromsizes("hg38")

    bins = bioframe.binnify(chromsizes, 100_000)
    bins

    # bin_gene_counts = bioframe.count_overlaps(bins, mouse_genes)
    # bin_gene_counts
    return


@app.cell
def _(model, uchi):
    w = uchi.Widget(model)
    w
    return


@app.cell
def _(ipc, model, pa):
    # Converting the Arrow IPC bytes to Arrow Table and then a pandas dataframe
    buf = pa.BufferReader(model)
    reader = ipc.RecordBatchFileReader(buf)

    table = reader.read_all()
    model_as_df = table.to_pandas()
    model_as_df
    return (model_as_df,)


@app.cell
def _(model_as_df):
    # 1. rename 'chr a' to 'chr1' etc.
    table_df = model_as_df.copy()

    # 2. add 'end' column, based on the binning resolution of the model
    table_df['end'] = table_df['coord'] + 100_000

    # # 3. rename 'coord' to 'start'
    table_df = table_df.rename(columns={'coord': 'start'})
    # table_df = table_df.rename(columns={'pos_end': 'end'})

    # 4. rename 'chr' to 'chrom'
    table_df = table_df.rename(columns={'chr': 'chrom'})

    table_df
    return (table_df,)


@app.cell
def _(table_df):
    table_chr16_df = table_df[table_df['chrom'] == "16(mat)"]
    table_chr16_df["chrom"] = "chr" + table_chr16_df["chrom"].str.extract(r"(\d+)")
    table_chr16_df
    return (table_chr16_df,)


@app.cell
def _(table_chr16_df, uchi):
    w2 = uchi.Widget(table_chr16_df)
    w2
    return


@app.cell
def _(table_chr16_df):
    table_chr16_df
    return


@app.cell
def _(compartments_df, pd, table_chr16_df):
    merged_df = pd.merge(table_chr16_df, compartments_df, on=["chrom", "start", "end"], how="inner")
    merged_df
    return (merged_df,)


@app.cell
def _(merged_df):
    merged_df_only_AB = merged_df.copy()
    merged_df_only_AB['comp_name'] = merged_df_only_AB['comp_name'].str[0]
    merged_df_only_AB
    return (merged_df_only_AB,)


@app.cell
def _(merged_df, uchi):
    vc = {
        "color": {

            "field": "comp_name",
            "colorScale": "Spectral"
        }, 
        "scale": 0.04, "links": False, "mark": "sphere"
    }

    w_final = uchi.Widget(merged_df, viewconfig=vc)
    w_final
    return


@app.cell
def _(merged_df_only_AB, uchi):
    vc2 = {
        "color": {
            "field": "comp_name",
            "colorScale": "Spectral"
        }, 
        "scale": 0.04, "links": False, "mark": "sphere"
    }

    w_final2 = uchi.Widget(merged_df_only_AB, viewconfig=vc2)
    w_final2
    return


@app.cell
def _():
    ## Appendix
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
    return (fetchFile,)


@app.cell
def _():
    import numpy as np
    import bioframe
    import uchimata as uchi
    import requests
    import marimo as mo
    return bioframe, requests, uchi


@app.cell
def _():
    import pyarrow as pa
    import pyarrow.ipc as ipc
    import pandas as pd
    return ipc, pa, pd


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
