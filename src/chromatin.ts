import type { Table } from "@uwdata/flechette";
import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
import { vec3 } from "gl-matrix";
import { assert } from "./assert";
import type {
  AssociatedValuesColor,
  AssociatedValuesScale,
  ChromatinScene,
  ChromatinStructure,
  DisplayableStructure,
  MarkTypes,
  ViewConfig,
} from "./chromatin-types";
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer";
import type { DrawableMarkSegment } from "./renderer/renderer-types";
import { divideRange, isBrewerPaletteName, valMap } from "./utils";

/**
 * Initializes a new empty chromatin scene.
 *
 * @returns A new ChromatinScene object with an empty structures array
 * @example
 * const scene = initScene();
 */
export function initScene(): ChromatinScene {
  return {
    structures: [],
  };
}

/**
 * Adds a chromatin structure to the scene with specified view configuration.
 *
 * @param scene - The chromatin scene to add the structure to
 * @param structure - The chromatin structure data to add
 * @param viewConfig - Optional visual configuration (scale, color, mark type, etc.). If not provided, defaults to scale: 0.0001 and color: "red"
 * @returns A new ChromatinScene with the structure added
 * @example
 * const scene = initScene();
 * const updatedScene = addStructureToScene(scene, structure, { scale: 0.005, color: "blue" });
 */
export function addStructureToScene(
  scene: ChromatinScene,
  structure: ChromatinStructure,
  viewConfig?: ViewConfig,
): ChromatinScene {
  //~ TODO: reconsider: is this the right place and way to default the viewConfig?
  if (viewConfig === undefined) {
    viewConfig = {
      scale: 0.0001,
      color: "red",
    };
  }

  const newDisplayableChunk: DisplayableStructure = {
    structure: structure,
    viewConfig: viewConfig,
  };
  scene = {
    ...scene,
    structures: [...scene.structures, newDisplayableChunk],
  };
  return scene;
}

/**
 * Parameters for the display function
 */
export type DisplayOptions = {
  alwaysRedraw?: boolean;
  withHUD?: boolean;
  hoverEffect?: boolean;
  ssaoIntensity?: number;
  ssaoParams?: {
    radius?: number;
    intensity?: number;
    falloff?: number;
  };
};

/**
 * Renders a chromatin scene and returns the renderer and canvas element.
 *
 * @param scene - The chromatin scene to render
 * @param options - Display options including alwaysRedraw, withHUD, and hoverEffect flags
 * @param targetCanvas - Optional canvas element to render into. If not provided, a new canvas will be created
 * @returns A tuple containing the renderer instance and the canvas/container element
 * @example
 * const [renderer, canvas] = display(scene, { alwaysRedraw: true, withHUD: false, hoverEffect: false });
 * document.body.appendChild(canvas);
 */
export function display(
  scene: ChromatinScene,
  options: DisplayOptions,
  targetCanvas?: HTMLCanvasElement,
): [ChromatinBasicRenderer, HTMLElement | HTMLCanvasElement] {
  const renderer = new ChromatinBasicRenderer({
    alwaysRedraw: options.alwaysRedraw,
    hoverEffect: options.hoverEffect,
    canvas: targetCanvas,
    ssaoParams: options.ssaoParams,
  });
  buildStructures(scene.structures, renderer);
  renderer.startDrawing();
  const canvas = renderer.getCanvasElement();

  let elementToReturn: HTMLElement | HTMLCanvasElement = canvas;
  if (options.withHUD) {
    //~ create debug info layer
    const debugInfo = document.createElement("div");
    debugInfo.innerText = "";
    debugInfo.style.position = "absolute";
    debugInfo.style.top = "10px";
    debugInfo.style.left = "10px";
    debugInfo.style.fontFamily = "'Courier New', monospace";

    const updateHUDText = (text: string) => {
      debugInfo.innerText = text;
    };

    renderer.addUpdateHUDCallback(updateHUDText);

    //~ create contaienr
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.height = "100%";

    container.appendChild(debugInfo);
    container.appendChild(canvas);
    elementToReturn = container;
  }

  return [renderer, elementToReturn];
}

/**
 * Updates the renderer with a new scene by clearing the existing scene and rebuilding it.
 *
 * @param renderer - The renderer instance to update
 * @param newScene - The new scene to render
 * @example
 * updateScene(renderer, newScene);
 */
export function updateScene(
  renderer: ChromatinBasicRenderer,
  newScene: ChromatinScene,
) {
  renderer.clearScene();
  buildStructures(newScene.structures, renderer);
  console.log(
    `Rebuilt the scene: # of objects: ${renderer.scene.children.length}`,
  );
}

function buildStructures(
  structures: DisplayableStructure[],
  renderer: ChromatinBasicRenderer,
) {
  for (const s of structures) {
    buildDisplayableStructure(s, renderer);
  }
}

export function resolveScale(table: Table, vc: ViewConfig): number | number[] {
  const defaultScale = 0.005; //~ default scale
  let scale: number | number[] = defaultScale;

  if (!vc.scale) {
    return scale;
  }

  if (typeof vc.scale === "number") {
    //~ scale is a constant number for all bins
    scale = vc.scale;
  } else if (vc.scale.field) {
    const fieldName = vc.scale.field;
    const valuesColumn = table.getChild(fieldName);
    if (valuesColumn) {
      scale = mapValuesToScale(Array.from(valuesColumn.toArray()), vc.scale);
    }
  } else {
    //~ scale is an array of numbers
    const values = vc.scale.values;
    if (!values) {
      return defaultScale; //~ return default scale
    }
    assert(
      values.length >= table.numRows,
      "array length of \`scale.values\` in view config must be equal or larger than the number of bins",
    );
    scale = mapValuesToScale(values, vc.scale);
  }
  return scale;
}

function mapValuesToScale(
  values: number[] | string[] | Float64Array | BigInt64Array,
  vcScaleField: AssociatedValuesScale,
): number[] {
  const min = vcScaleField.min ?? 0; // default range <0, 1> seems reasonable...
  const max = vcScaleField.max ?? 1;
  const scaleMin = vcScaleField.scaleMin || 0.01; // TODO: define default somewhere more explicit
  const scaleMax = vcScaleField.scaleMax || 0.05; // TODO: define default somewhere more explicit

  if (Array.isArray(values) && values.every((d) => typeof d === "string")) {
    //~ values is string[] => nominal size scale

    // one pass to find how many unique values there are in the column
    const uniqueValues = new Set<string>(values);
    const numUniqueValues = uniqueValues.size;

    //~ divides the <scaleMin, scaleMax> range into numUniqueValues parts
    const mapScalesValues = new Map<string, number>();
    const scales = divideRange(scaleMin, scaleMax, numUniqueValues);
    for (const [i, v] of [...uniqueValues].entries()) {
      const newScale = scales[i];
      if (!mapScalesValues.has(v)) {
        mapScalesValues.set(v, newScale);
      }
    }
    return values.map((v) => mapScalesValues.get(v) || scaleMin);
  }

  if (Array.isArray(values) && values.every((d) => typeof d === "number")) {
    //~ quantitative size scale
    return values.map((v) => valMap(v, min, max, scaleMin, scaleMax));
  }

  if (values instanceof Float64Array) {
    return Array.from(values, (v) => valMap(v, min, max, scaleMin, scaleMax));
  }

  if (values instanceof BigInt64Array) {
    return Array.from(values, (v) =>
      valMap(Number(v), min, max, scaleMin, scaleMax),
    ); //~ is it sketchy to convert bigint to number?
  }

  console.warn("Not implemented: something went wrong in mapValuesToScale");
  return [];
}

function mapValuesToColors(
  values: number[] | string[] | Float64Array | BigInt64Array,
  vcColorField: AssociatedValuesColor,
): ChromaColor[] {
  const defaultColor = chroma("red"); //~ default color is red

  //~ asserting that the colorScale supplied is a valid chroma scale
  if (typeof vcColorField.colorScale === "string") {
    assert(isBrewerPaletteName(vcColorField.colorScale));
  }

  if (Array.isArray(values) && values.every((d) => typeof d === "string")) {
    //~ values: string[] => nominal color scale

    // one pass to find how many unique values there are in the column
    const uniqueValues = new Set<string>(values);
    const numUniqueValues = uniqueValues.size;

    const mapColorsValues = new Map<string, ChromaColor>();

    let colors: string[] = [];
    if (typeof vcColorField.colorScale === "string") {
      colors = chroma.scale(vcColorField.colorScale).colors(numUniqueValues);
    } else {
      colors = vcColorField.colorScale;
    }
    for (const [i, v] of [...uniqueValues].entries()) {
      const newColor = colors[i];
      if (!mapColorsValues.has(v)) {
        mapColorsValues.set(v, chroma(newColor));
      }
    }

    return values.map((v) => mapColorsValues.get(v) || defaultColor);
  }

  //~ prepare the color scale
  const min = vcColorField.min ?? 0; // default range <0, 1> seems reasonable...
  const max = vcColorField.max ?? 1;
  //~ DK: For some reason, typescript complains if you don't narrow the type, even though the call is exactly the same.
  //~ This doesn't work: `const colorScale = chroma.scale(vc.color.colorScale)`
  const colorScale =
    typeof vcColorField.colorScale === "string"
      ? chroma.scale(vcColorField.colorScale)
      : chroma.scale(vcColorField.colorScale);
  const scaledScale = colorScale.domain([min, max]);
  let colorValues: chroma.Color[] = [];

  if (values instanceof Float64Array) {
    colorValues = Array.from(values, (v) => scaledScale(v));
  }

  if (values instanceof BigInt64Array) {
    colorValues = Array.from(values, (v) => scaledScale(Number(v))); //~ is it sketchy to convert bigint to number?
  }

  if (Array.isArray(values) && values.every((d) => typeof d === "number")) {
    colorValues = values.map((v) => scaledScale(v));
  }
  return colorValues;
}

export function resolveColor(
  table: Table,
  vc: ViewConfig,
): ChromaColor | ChromaColor[] {
  const defaultColor = chroma("red"); //~ default color is red
  let color: ChromaColor | ChromaColor[] = defaultColor; //~ default color is red

  if (!vc.color) {
    return color; //~ return default color
  }

  if (typeof vc.color === "string") {
    //~ color is a single color string
    color = chroma(vc.color);
  } else if (vc.color.field) {
    //~ color should be based on values in a column name in 'field'
    const fieldName = vc.color.field;
    const valuesColumn = table.getChild(fieldName);
    if (!valuesColumn) {
      throw new Error(`Field '${fieldName}' not found in table`);
    }
    color = mapValuesToColors(Array.from(valuesColumn.toArray()), vc.color);
  } else {
    //~ color should be based on values in the 'values' array
    if (!vc.color.values) {
      return defaultColor; //~ return default color
    }
    assert(
      vc.color.values.length >= table.numRows,
      "array length of \`color.values\` in view config must be equal or larger than the number of bins",
    );
    color = mapValuesToColors(vc.color.values, vc.color);
  }
  return color;
}

function buildDisplayableStructure(
  structure: DisplayableStructure,
  renderer: ChromatinBasicRenderer,
) {
  const vc = structure.viewConfig;

  //1. assemble the xyz into vec3s
  const xCol = structure.structure.data.getChild("x");
  const yCol = structure.structure.data.getChild("y");
  const zCol = structure.structure.data.getChild("z");
  assert(xCol && yCol && zCol, "x, y, z columns must be present in data");
  const xArr = Array.from(xCol.toArray()) as number[];
  const yArr = Array.from(yCol.toArray()) as number[];
  const zArr = Array.from(zCol.toArray()) as number[];

  const chrColumn = structure.structure.data.getChild("chr");
  const chrArr = chrColumn
    ? (Array.from(chrColumn.toArray()) as string[])
    : undefined;
  const idxColumn = structure.structure.data.getChild("index");
  const idxArr = idxColumn
    ? (Array.from(idxColumn.toArray()) as number[])
    : undefined;

  const positions: vec3[] = [];
  for (let i = 0; i < structure.structure.data.numRows; i++) {
    positions.push(vec3.fromValues(xArr[i], yArr[i], zArr[i]));
  }

  //2. calculate the visual attributes based on the viewConfig
  const color = resolveColor(structure.structure.data, vc);
  const scale = resolveScale(structure.structure.data, vc);

  const segments = breakIntoContinuousSegments(
    positions,
    idxArr,
    chrArr,
    color,
    scale,
    vc.mark || "sphere",
    vc.links ?? false,
    vc.linksScale ?? 1.0,
    vc.position ?? vec3.fromValues(0, 0, 0),
  );

  renderer.addSegments(segments);
}

type SegmentData = {
  start: number;
  end: number;
};

/**
 * Returns an array of starts/ends of segments.
 * Two conditions for breaking into a segment:
 *     - indices are continuous (safeguarding against gaps in the indices from filtering)
 *     - chromosome annotation (not linking between chromosomes)
 */
function computeSegments(
  rowsNum: number,
  chromosomeColumn: string[] | undefined,
  indicesColumn: number[] | undefined,
): SegmentData[] {
  const segmentsData: SegmentData[] = [];

  const chr = chromosomeColumn;
  const idx = indicesColumn;

  for (let cIndex = 0; cIndex < rowsNum; ) {
    const start = cIndex;

    while (
      cIndex + 1 < rowsNum &&
      (!idx || idx[cIndex + 1] - idx[cIndex] === 1) &&
      (!chr || chr[cIndex] === chr[cIndex + 1])
    ) {
      cIndex += 1;
    }

    const end = cIndex;
    segmentsData.push({
      start: start,
      end: end,
    });
    cIndex += 1;
  }

  console.log(`Found segments: ${segmentsData.length}`);
  return segmentsData;
}

if (import.meta.vitest) {
  const { describe, test, expect } = import.meta.vitest;

  describe("computeSegments", () => {
    test("should create single segment for continuous indices and same chromosome", () => {
      const rowsNum = 3;
      const chromosomeColumn = ["chr1", "chr1", "chr1"];
      const indicesColumn = [0, 1, 2];

      const segments = computeSegments(
        rowsNum,
        chromosomeColumn,
        indicesColumn,
      );

      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({ start: 0, end: 2 });
    });

    test("should break segment when chromosome changes", () => {
      const rowsNum = 4;
      const chromosomeColumn = ["chr1", "chr1", "chr2", "chr2"];
      const indicesColumn = [0, 1, 2, 3];

      const segments = computeSegments(
        rowsNum,
        chromosomeColumn,
        indicesColumn,
      );

      expect(segments).toHaveLength(2);
      expect(segments[0]).toEqual({ start: 0, end: 1 });
      expect(segments[1]).toEqual({ start: 2, end: 3 });
    });

    test("should break segment when indices are not continuous", () => {
      const rowsNum = 4;
      const chromosomeColumn = ["chr1", "chr1", "chr1", "chr1"];
      const indicesColumn = [0, 1, 5, 6];

      const segments = computeSegments(
        rowsNum,
        chromosomeColumn,
        indicesColumn,
      );

      expect(segments).toHaveLength(2);
      expect(segments[0]).toEqual({ start: 0, end: 1 });
      expect(segments[1]).toEqual({ start: 2, end: 3 });
    });

    test("should handle undefined columns", () => {
      const rowsNum = 3;

      const segments = computeSegments(rowsNum, undefined, undefined);

      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({ start: 0, end: 2 });
    });
  });
}

/**
 *
 * Breaks up the model into continous segments (same mark, possibly linked). Looks at both continuity in the indices and in the chromosome column.
 */
function breakIntoContinuousSegments(
  positions: vec3[],
  indicesColumn: number[] | undefined,
  chromosomeColumn: string[] | undefined,
  color: ChromaColor | ChromaColor[],
  scale: number | number[],
  mark: MarkTypes,
  links: boolean,
  linksScale: number,
  position: vec3,
): DrawableMarkSegment[] {
  console.log("breaking into segments");

  const segmentsData = computeSegments(
    positions.length,
    chromosomeColumn,
    indicesColumn,
  );

  //~ slice the bin data into segments based on the information computed in previous step
  const segments = segmentsData.map((segmentData) => {
    const s = segmentData.start;
    const e = segmentData.end + 1;
    return {
      mark: mark,
      positions: positions.slice(s, e),
      attributes: {
        color: Array.isArray(color) ? color.slice(s, e) : color,
        size: Array.isArray(scale) ? scale.slice(s, e) : scale,
        makeLinks: links,
        linksScale: linksScale,
        position: position,
      },
    };
  });

  return segments;
}
