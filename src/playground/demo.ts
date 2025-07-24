import type { ViewConfig } from "../chromatin-types.ts";
import {
  addStructureToScene,
  type ChromatinScene,
  display,
  initScene,
  loadFromURL,
} from "../main.ts";
import {
  makeCuttingPlane,
  //selectChromosome,
  //selectRange,
  sphereSelect,
} from "../selections/selections.ts";

enum ExampleType {
  WholeGenome = 0,
  WholeGenomeWithLinks = 1,
  Chunk = 2,
  BasicChunk = 3,
  AdvancedChunk = 4,
  WholeGenomeWithFilters = 5,
}

const setupWholeGenomeExampleWithLinks = async (): Promise<ChromatinScene> => {
  const vc: ViewConfig = {
    color: {
      field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
      colorScale: "spectral",
    },
    links: true,
    linksScale: 0.5,
  };

  return await setupWholeGenomeExample(vc);
};

const setupWholeGenomeExampleWithFilters =
  async (): Promise<ChromatinScene> => {
    const urlStevens =
      "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow";

    let chromatinScene = initScene();

    const structure = await loadFromURL(urlStevens, {
      center: true,
      normalize: true,
    });
    if (!structure) {
      console.warn("unable to load structure from URL!");
      return chromatinScene;
    }

    //const newTable = await makeCuttingPlane(structure.data, "y");
    //const newTable = await selectChromosome(structure.data, "chr a");
    //const newTable = await selectRange(
    //  structure.data,
    //  "chr s",
    //  3000000,
    //  6000000,
    //);
    const newTable = await sphereSelect(structure.data, 0.1, 0, 0, 0.1);

    const halfCutTable = await makeCuttingPlane(structure.data, "x", 0);

    const subsetStructure = {
      ...structure,
      data: newTable,
    };

    const vc: ViewConfig = {
      color: {
        field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
        colorScale: "set1",
      },
      links: true,
      //linksScale: 0.5,
      linksScale: 1.0,
    };

    chromatinScene = addStructureToScene(
      chromatinScene,
      { ...structure, data: halfCutTable },
      {
        color: "gainsboro",
        links: true,
        scale: 0.004,
        linksScale: 1.0,
      },
    );
    //chromatinScene = addStructureToScene(chromatinScene, structure, {
    //  color: "gainsboro",
    //  links: true,
    //  scale: 0.004,
    //  linksScale: 1.0,
    //});
    chromatinScene = addStructureToScene(chromatinScene, subsetStructure, vc);

    return chromatinScene;
  };

const setupWholeGenomeExample = async (
  viewConfig: ViewConfig | undefined = undefined,
): Promise<ChromatinScene> => {
  const urlStevens =
    "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow";

  let chromatinScene = initScene();

  const structure = await loadFromURL(urlStevens, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return chromatinScene;
  }
  console.log(`loaded structure: ${structure.name}`);

  const vc = viewConfig ?? {
    color: {
      field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
      colorScale: "spectral",
    },
  };

  chromatinScene = addStructureToScene(chromatinScene, structure, vc);

  return chromatinScene;
};

const setupBasicChunkExample = async (): Promise<ChromatinScene> => {
  const urlChr2 =
    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/chr2.arrow";

  let chromatinScene = initScene();

  const structure = await loadFromURL(urlChr2, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return chromatinScene;
  }
  console.log(`loaded structure: ${structure.name}`);

  const viewConfig = {
    color: "lightblue",
    links: true,
  };

  chromatinScene = addStructureToScene(chromatinScene, structure, viewConfig);

  return chromatinScene;
};

const setupAdvancedChunkExample = async (): Promise<ChromatinScene> => {
  const urlChr2 =
    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/chr2.arrow";

  let chromatinScene = initScene();

  const structure = await loadFromURL(urlChr2, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return chromatinScene;
  }
  console.log(`loaded structure: ${structure.name}`);

  //const newTable = await get(structure.data, "chr a", );
  const newTable = await makeCuttingPlane(structure.data, "y", 0.25);

  const subsetStructure = {
    ...structure,
    data: newTable,
  };
  const binsNum = subsetStructure.data.numRows;
  const sinValues = Array.from(
    { length: binsNum },
    (_, i) => 0.5 * Math.sin(i / 10) + 1,
  );

  const values = sinValues;

  const viewConfig = {
    color: {
      values: values,
      min: 0,
      max: 1,
      colorScale: "viridis",
    },
    links: true,
    scale: {
      values: values,
      min: 0,
      max: 1,
      scaleMin: 0.005,
      scaleMax: 0.01,
    },
    linksScale: 0.5,
  };

  chromatinScene = addStructureToScene(
    chromatinScene,
    subsetStructure,
    viewConfig,
  );

  chromatinScene = addStructureToScene(chromatinScene, structure, {
    color: "gainsboro",
  });

  return chromatinScene;
};

const setupChunkExample = async (): Promise<ChromatinScene> => {
  const urlStevensChrf =
    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/Stevens-2017_GSM2219497_Cell_1_model_1_chr_f.arrow";

  let chromatinScene = initScene();

  const structure = await loadFromURL(urlStevensChrf, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return chromatinScene;
  }
  console.log(`loaded structure: ${structure.name}`);

  const minVal = 0;
  const maxVal = structure.data.numRows;

  const vals = Array.from({ length: structure.data.numRows }, (_, i) => {
    return i;
  });

  const viewConfig = {
    // scale: 0.01,
    scale: {
      values: vals,
      min: minVal,
      max: maxVal,
      scaleMin: 0.005,
      scaleMax: 0.03,
    },
    color: {
      values: vals,
      min: minVal,
      max: maxVal,
      // colorScale: "spectral",
      colorScale: "Spectral",
    },
  };

  chromatinScene = addStructureToScene(chromatinScene, structure, viewConfig);

  return chromatinScene;
};

(async () => {
  //const exampleToUse: ExampleType =
  //  ExampleType.WholeGenomeWithLinks as ExampleType;
  //const exampleToUse: ExampleType = ExampleType.AdvancedChunk as ExampleType;
  //const exampleToUse: ExampleType = ExampleType.Chunk as ExampleType;
  //const exampleToUse: ExampleType = ExampleType.BasicChunk as ExampleType;
  const exampleToUse: ExampleType =
    ExampleType.WholeGenomeWithFilters as ExampleType;
  let chromatinScene = initScene();
  switch (exampleToUse) {
    case ExampleType.WholeGenome:
      chromatinScene = await setupWholeGenomeExampleWithLinks();
      break;
    case ExampleType.Chunk:
      chromatinScene = await setupChunkExample();
      break;
    case ExampleType.WholeGenomeWithLinks:
      chromatinScene = await setupWholeGenomeExampleWithLinks();
      break;
    case ExampleType.BasicChunk:
      chromatinScene = await setupBasicChunkExample();
      break;
    case ExampleType.AdvancedChunk:
      chromatinScene = await setupAdvancedChunkExample();
      break;
    case ExampleType.WholeGenomeWithFilters:
      chromatinScene = await setupWholeGenomeExampleWithFilters();
      break;
  }

  const [_, canvas] = display(chromatinScene, {
    alwaysRedraw: false,
    withHUD: false,
  });

  //cutting-plane-slider
  const sliderEl = document.getElementById("cutting-plane-slider") as HTMLInputElement;
  if (sliderEl) {
    //sliderEl.addEventListener("input", async (_) => {
    //  console.log(`slider value changed: ${sliderEl.value}`);
    //
    //  const halfCutTable = await makeCuttingPlane(structure.data, "x", sliderEl.valueAsNumber);
    //});
  }

  //~ add canvas to the page
  const appEl = document.querySelector("#app");
  if (canvas && appEl) {
    appEl.appendChild(canvas);
  }
})();
