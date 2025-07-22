import { effect, signal } from "@preact/signals-core";
import type { ViewConfig } from "../../src/chromatin-types.ts";
import {
  addStructureToScene,
  type ChromatinBasicRenderer,
  type ChromatinScene,
  display,
  initScene,
  loadFromURL,
} from "../../src/main.ts";

const setupWholeGenomeExampleWithLinks = async (
  url: string,
): Promise<ChromatinScene> => {
  const vc: ViewConfig = {
    color: {
      field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
      colorScale: "spectral",
    },
    links: true,
    linksScale: 0.5,
  };

  return await setupWholeGenomeExample(vc, url);
};

const setupWholeGenomeExample = async (
  viewConfig: ViewConfig | undefined,
  url: string,
): Promise<ChromatinScene> => {
  //const urlStevens =
  //  "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow";
  const urlStevens = url;

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

//const setupAdvancedChunkExample = async (
//  colorscale: string | undefined = undefined,
//): Promise<ChromatinScene> => {
//  const urlChr2 =
//    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/chr2.arrow";
//
//  let chromatinScene = initScene();
//
//  const structure = await loadFromURL(urlChr2, {
//    center: true,
//    normalize: true,
//  });
//  if (!structure) {
//    console.warn("unable to load structure from URL!");
//    return chromatinScene;
//  }
//  console.log(`loaded structure: ${structure.name}`);
//
//  const binsNum = structure.data.numRows;
//  const sinValues = Array.from(
//    { length: binsNum },
//    (_, i) => 0.5 * Math.sin(i / 10 + Math.PI) + 1,
//  );
//
//  const values = sinValues;
//
//  const viewConfig = {
//    color: {
//      values: values,
//      min: 0,
//      max: 1,
//      colorScale: colorscale ?? "viridis",
//    },
//    links: true,
//    scale: {
//      values: values,
//      min: 0,
//      max: 1,
//      scaleMin: 0.005,
//      scaleMax: 0.01,
//    },
//    linksScale: 0.5,
//  };
//
//  chromatinScene = addStructureToScene(chromatinScene, structure, viewConfig);
//
//  return chromatinScene;
//};

async function setScene(
  _colorscale: string,
  url: string,
): Promise<[ChromatinBasicRenderer, HTMLElement | HTMLCanvasElement]> {
  let chromatinScene = initScene();
  //chromatinScene = await setupAdvancedChunkExample(colorscale);
  //chromatinScene = await setupWholeGenomeExampleWithLinks("https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow");

  chromatinScene = await setupWholeGenomeExampleWithLinks(url);

  const [renderer, canvas] = display(chromatinScene, {
    alwaysRedraw: false,
    withHUD: false,
  });
  return [renderer, canvas];
}

(async () => {
  const cameraState = signal({
    position: { x: 0, y: 0, z: 3.0 },
    rotation: { x: 0, y: 0, z: 0 },
  });

  const [rendererA, canvasA] = await setScene(
    "viridis",
    "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219501_Cell_5_model_10.arrow",
  );
  const [rendererB, canvasB] = await setScene(
    "spectral",
    "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219502_Cell_6_model_1.arrow",
  );

  rendererA.controls.addEventListener("change", () => {
    cameraState.value = {
      position: {
        x: rendererA.camera.position.x,
        y: rendererA.camera.position.y,
        z: rendererA.camera.position.z,
      },
      rotation: {
        x: rendererA.camera.rotation.x,
        y: rendererA.camera.rotation.y,
        z: rendererA.camera.rotation.z,
      },
    };
  });

  rendererB.controls.addEventListener("change", () => {
    cameraState.value = {
      position: {
        x: rendererB.camera.position.x,
        y: rendererB.camera.position.y,
        z: rendererB.camera.position.z,
      },
      rotation: {
        x: rendererB.camera.rotation.x,
        y: rendererB.camera.rotation.y,
        z: rendererB.camera.rotation.z,
      },
    };
  });

  effect(() => {
    console.log(`camera changed: ${cameraState.value.position}`);
    rendererB.camera.position.set(
      cameraState.value.position.x,
      cameraState.value.position.y,
      cameraState.value.position.z,
    );
    rendererB.camera.rotation.set(
      cameraState.value.rotation.x,
      cameraState.value.rotation.y,
      cameraState.value.rotation.z,
    );
    rendererA.camera.position.set(
      cameraState.value.position.x,
      cameraState.value.position.y,
      cameraState.value.position.z,
    );
    rendererA.camera.rotation.set(
      cameraState.value.rotation.x,
      cameraState.value.rotation.y,
      cameraState.value.rotation.z,
    );
  });

  //~ add canvas to the page
  const appElA = document.querySelector("#canvas-one");
  if (canvasA && appElA) {
    appElA.appendChild(canvasA);
  }

  //~ add canvas to the page
  const appElB = document.querySelector("#canvas-two");
  if (canvasB && appElB) {
    appElB.appendChild(canvasB);
  }
})();
