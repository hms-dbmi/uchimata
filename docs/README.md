# documentation

## Main features:

- simple way to visualize 3D chromatin models
- easy to integrate in different environments and applications
- [WIP] expressive linking of additional genomic data to the 3D structure (mainly via
  mapping to visual attributes)
- [WIP] selecting parts based on genomic coordinates

## Quick start 

```typescript 
//~ load test data 
const urlStevens =
  "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow";


const structure = await loadFromURL(urlStevens, {
  center: true,
  normalize: true,
});

//~ config specifies how the 3D model will look 
const viewConfig = {
  color: {
    field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
    colorScale: "spectral",
  },
  scale: 0.05,
};

//~ create a scene 
let chromatinScene = chs.initScene(); 
chromatinScene = addStructureToScene(chromatinScene, structure, vc);

const [renderer, canvas] = chs.display(chromatinScene, { alwaysRedraw: false});

//~ ObservableHQ only: mechanism for clean-up after cell re-render
invalidation.then(() => renderer.endDrawing());

return renderer.getCanvasElement(); //~ add this element to the DOM any way you need
```

## Data loading

The core uchimata library accepts only data that are in the [Apache
Arrow](https://arrow.apache.org) IPC data format.

### Why Arrow?

We've encountered several file formats used to store 3D coordinates of
chromatin bins. Some come from proteomics tools (such as `PDB` or `CIF`),
others are very general data file formats (e.g., `CVS`, `TSV`, `XYZ`). Few
tools define their own formats: `nucle3d`, `3dg`, or
[g3d](https://g3d.readthedocs.io/en/latest/intro.html). At their core, however,
all these formats store 3 floating-point numbers (xyz coordinates) and some
other columns (e.g., chromosome or genomic coordinate). Storing such
information in formats that are based on delimiter-separated text files is
often error prone and leads to incompatibility issues down the line.

[Apache Arrow](https://arrow.apache.org) is a standard for storing columnar
data in memory and on disk. It is much more widespread, which allows us to
leverage libraries and tools developed outside of computational biology. As a
standard data format, Arrow integrates much more seamlessly with other data
structures commonly used in data science. For example, it is very easy to
[convert to/from numpy arrays](https://arrow.apache.org/docs/python/numpy.html)
using the Python `pyarrow` library. Similarly [with
pandas](https://arrow.apache.org/docs/python/pandas.html).

### Converting to Arrow

To produce Arrow files from Python, we recommend consulting the Python Arrow
Cookbook [example for writing Arrow to
disk](https://arrow.apache.org/cookbook/py/io.html#saving-arrow-arrays-to-disk)

We provide also provide a script (written in JS, using
[deno](https://docs.deno.com)) for converting some of the above-mentioned file
formats to `.arrow` files.

More info: [scripts folder](/scripts)

## View Config 

The main data loaded from a file is a sequence of XYZ coordinates of bins.
Points in space have no real appearance. Several other tools make assumptions
about the visual representation of bins.
We use a `ViewConfig` structure to define how a certain chromatin segment
should be displayed. 

```typescript 
export type ViewConfig = {
  scale?: number | AssociatedValuesScale; 
  color?: string | AssociatedValuesColor; 
  mark?: MarkTypes; 
  links?: boolean; 
}; 
```

The type unions with `AssociatedValuesScale` and `AssociatedValuesColor` exist
to support binding other genomic data values onto these visual channels,
instead of only setting them to constant value.
