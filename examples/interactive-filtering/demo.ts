import type { ChromatinStructure } from "../../src/chromatin-types.ts";
import {
  addStructureToScene,
  type ChromatinScene,
  display,
  initScene,
  loadFromURL,
  makeCuttingPlane,
  //selectChromosome,
  //sphereSelect,
  updateScene,
} from "../../src/main.ts";

const setupWholeGenomeExampleWithFilters = async (): Promise<
  [ChromatinScene, ChromatinStructure | null]
> => {
  const urlStevens =
    "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow";

  let chromatinScene = initScene();

  const structure = await loadFromURL(urlStevens, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return [chromatinScene, null];
  }

  //const newTable = await sphereSelect(structure.data, 0.1, 0, 0, 0.1);
  const halfCutTable = await makeCuttingPlane(structure.data, "x", 0);

  chromatinScene = addStructureToScene(
    chromatinScene,
    { data: halfCutTable },
    {
      color: "gainsboro",
      links: true,
      scale: 0.004,
      linksScale: 1.0,
    },
  );
  //chromatinScene = addStructureToScene(chromatinScene, structure, {
  //  color: {
  //    field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
  //    colorScale: "set1",
  //  },
  //  links: true,
  //  linksScale: 1.0,
  //});

  return [chromatinScene, structure];
};

setupWholeGenomeExampleWithFilters().then(([scene, structure]) => {
  const [renderer, canvas] = display(scene, {
    alwaysRedraw: false,
    //alwaysRedraw: true,
    withHUD: false,
  });

  const appEl = document.querySelector("#app");
  if (appEl) {
  }

  const sliderEl = document.getElementById(
    "cutting-plane-slider",
  ) as HTMLInputElement;
  if (sliderEl) {
    sliderEl.addEventListener("input", async (_) => {
      console.log(`slider value changed: ${sliderEl.value}`);

      const makeCutAt = sliderEl.valueAsNumber;
      if (structure) {
        const halfCutTable = await makeCuttingPlane(
          structure.data,
          "x",
          makeCutAt,
          true,
        );

        const otherhalfCutTable = await makeCuttingPlane(
          structure.data,
          "x",
          makeCutAt,
        );

        let newScene = initScene();

        newScene = addStructureToScene(
          newScene,
          { data: otherhalfCutTable },
          {
            color: "gainsboro",
            scale: {
              field: "x",
              min: -0.1 + makeCutAt,
              //max: 0.5,
              max: makeCutAt,
              scaleMin: 0.0005,
              scaleMax: 0.005,
            },
          },
        );
        newScene = addStructureToScene(
          newScene,
          { data: halfCutTable },
          {
            //color: "red",
            color: {
              field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
              colorScale: "set1",
            },
            links: true,
          },
        );
        updateScene(renderer, newScene);
      }
    });
  }

  //~ add canvas to the page
  const appElA = document.querySelector("#app");
  if (canvas && appElA) {
    appElA.appendChild(canvas);
  }
});
