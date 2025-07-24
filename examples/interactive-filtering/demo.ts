import type { ChromatinStructure, ViewConfig } from "../../src/chromatin-types.ts";
import {
  addStructureToScene,
  type ChromatinScene,
  display,
  initScene,
  loadFromURL,
  makeCuttingPlane,
  sphereSelect,
  updateScene,
} from "../../src/main.ts";

const setupWholeGenomeExampleWithFilters =
  async (): Promise<[ChromatinScene, ChromatinStructure | null]> => {
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
    chromatinScene = addStructureToScene(chromatinScene, subsetStructure, vc);

    return [chromatinScene, structure];
  };

setupWholeGenomeExampleWithFilters().then(([scene, structure]) => {
  const [renderer, canvas] = display(scene, {
    alwaysRedraw: false,
    withHUD: false,
  });

  const appEl = document.querySelector("#app");
  if (appEl) {
  }

  const sliderEl = document.getElementById("cutting-plane-slider") as HTMLInputElement;
  if (sliderEl) {
    sliderEl.addEventListener("input", async (_) => {
      console.log(`slider value changed: ${sliderEl.value}`);

      if (structure) {
        const halfCutTable = await makeCuttingPlane(structure.data, "x", sliderEl.valueAsNumber);
        let newScene = initScene();
        newScene = addStructureToScene(newScene, { data: halfCutTable },
          {
            color: "gainsboro",
            links: true,
            scale: 0.004,
            linksScale: 1.0,
          },
        );
        updateScene(renderer, newScene);
      }

      //if (structure) {
      //  const halfCutTable = await makeCuttingPlane(structure.data, "x", sliderEl.valueAsNumber);
      //
      //  let newScene = initScene();
      //  newScene = addStructureToScene(newScene, { data: halfCutTable },
      //    {
      //      color: "gainsboro",
      //      links: true,
      //      scale: 0.004,
      //      linksScale: 1.0,
      //    },
      //  );
      //  const _ = display(newScene, {
      //    alwaysRedraw: false,
      //    withHUD: false,
      //  }, canvas as HTMLCanvasElement);
      //}
    });
  }

  //~ add canvas to the page
  const appElA = document.querySelector("#app");
  if (canvas && appElA) {
    appElA.appendChild(canvas);
  }
});
