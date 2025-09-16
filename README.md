# uchimata 🧬🥋

> Throw your genomic data into space!

![uchimata teaser](https://dl.dropboxusercontent.com/scl/fi/y03zd8nv53bxohlh9yzqb/chromospace-repo-teaser.png?rlkey=2g7v31wxg79covnatrj2oekei&dl=0)

:warning: **NOTE** :construction:: `uchimata` is still in development.

## Key concepts

- **Genomics semantics**: Molecular visualization tools are often used for examining chromatin 3D data. The limiting factor in that case are the missing proper semantics when analyzing the spatial structures. For example, selecting part of the model should be possible using genomic coordinates (not "atom" indices).
- **Made for computational notebooks**: We need to meet computational biologists where they typically work. Integration in computational notebooks is therefore a critical feature. As a Javascript library, integration in Observable Notebooks is free. Using `uchimata` in Python-based notebooks (e.g., Jupyter Notebook/Lab or Google Colab) is made possible thanks to the wonderful [anywidget](https://github.com/manzt/anywidget) library: see [uchimata-py](https://github.com/hms-dbmi/uchimata-py).
- **Staying small and focused**: The many bioinformatics file formats can lead to bloated software that tries to capture every use case. Such software is then hard to maintain. The idea here is to keep `uchimata` small, doing one thing, hopefully extremely well: visualize 3D chromatin structures with a variety of declaratively specified representations. Additional functionality should be build on top as further libraries and applications. With the computational notebooks integration, we can also afford to leave much of processing to the ecosystem of other bioinformatics tooling.

## About

Led by [David Kouřil](https://davidkouril.com) @ [HIDIVE lab](http://hidivelab.org) (Harvard Medical School).

The name **uchimata** roughly abbreviates "**u**nderstanding **ch**romatin **i**n **m**odels **a**pproximating **t**hree-dimensional **a**rchitecture". The tool was previously known as *chromospace*.
