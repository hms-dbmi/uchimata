import {
  addStructureToScene,
  ChromatinBasicRenderer,
  type ChromatinScene,
  display,
  initScene,
  loadFromURL,
} from "../../src/main.ts";

const setupAdvancedChunkExample = async (colorscale: string | undefined = undefined): Promise<ChromatinScene> => {
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

  const binsNum = structure.data.numRows;
  const sinValues = Array.from(
    { length: binsNum },
    (_, i) => 0.5 * Math.sin(i / 10 + Math.PI) + 1,
  );

  const values = sinValues;

  const viewConfig = {
    color: {
      values: values,
      min: 0,
      max: 1,
      colorScale: colorscale ?? "viridis",
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

  chromatinScene = addStructureToScene(chromatinScene, structure, viewConfig);

  return chromatinScene;
};

async function setScene(colorscale: string): Promise<[ChromatinBasicRenderer, HTMLElement | HTMLCanvasElement]> {
  let chromatinScene = initScene();
  chromatinScene = await setupAdvancedChunkExample(colorscale);
  const [renderer, canvas] = display(chromatinScene, {
    alwaysRedraw: false,
    withHUD: false,
  });
  return [renderer, canvas];
}

(async () => {

  const [rendererA, canvasA] = await setScene("viridis");
  const [rendererB, canvasB] = await setScene("spectral");

  //rendererA.setCameraParams(vec3.fromValues(0, 0, 3.0));

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
