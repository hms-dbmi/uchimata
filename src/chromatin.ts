import type { Table } from "apache-arrow";
import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
import { vec3 } from "gl-matrix";
import type {
  AssociatedValuesColor,
  ChromatinScene,
  ChromatinStructure,
  DisplayableStructure,
  MarkTypes,
  ViewConfig,
} from "./chromatin-types";
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer";
import type { DrawableMarkSegment } from "./renderer/renderer-types";
import { valMap } from "./utils";
import { start } from "repl";

/**
 * Simple initializer for the ChromatinScene structure.
 */
export function initScene(): ChromatinScene {
  return {
    structures: [],
  };
}

export function addStructureToScene(
  scene: ChromatinScene,
  structure: ChromatinStructure,
  viewConfig?: ViewConfig,
): ChromatinScene {
  //~ TODO: reconsider: is this the right place and way to default the viewConfig?
  if (viewConfig === undefined) {
    viewConfig = {
      scale: 0.0001,
      color: undefined,
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
};

/**
 * Starts rendering of a scene. Returns a renderer object and a canvas.
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

function buildStructures(
  structures: DisplayableStructure[],
  renderer: ChromatinBasicRenderer,
) {
  for (const s of structures) {
    buildDisplayableStructure(s, renderer);
  }
}

function resolveScale(vc: ViewConfig): number | number[] {
  const defaultScale = 0.005; //~ default scale
  let scale: number | number[] = defaultScale;

  if (!vc.scale) {
    return scale;
  }

  if (typeof vc.scale === "number") {
    //~ scale is a constant number for all bins
    scale = vc.scale;
  } else {
    //~ scale is an array of numbers
    const values = vc.scale.values;
    if (!values) {
      return defaultScale; //~ return default scale
    }
    if (values.every((d) => typeof d === "number")) {
      //~ quantitative size scale
      const min = vc.scale.min ?? 0; // default range <0, 1> seems reasonable...
      const max = vc.scale.max ?? 1;
      const scaleMin = vc.scale.scaleMin || 0.001; // TODO: define default somewhere more explicit
      const scaleMax = vc.scale.scaleMax || 0.05; // TODO: define default somewhere more explicit
      scale = values.map((v) => valMap(v, min, max, scaleMin, scaleMax));
    } else {
      //~ string[] => nominal size scale
      // TODO:
      console.warn("TODO: not implemented (nominal size scale for chunk)");
    }
  }
  return scale;
}

function mapValuesToColors(
  values: number[] | string[],
  vcColorField: AssociatedValuesColor,
): ChromaColor[] {
  const defaultColor = chroma("red"); //~ default color is red

  if (values.every((d) => typeof d === "number")) {
    const min = vcColorField.min ?? 0; // default range <0, 1> seems reasonable...
    const max = vcColorField.max ?? 1;

    //~ DK: For some reason, typescript complains if you don't narrow the type, even though the call is exactly the same.
    //~ This doesn't work: `const colorScale = chroma.scale(vc.color.colorScale)`
    const colorScale =
      typeof vcColorField.colorScale === "string"
        ? chroma.scale(vcColorField.colorScale)
        : chroma.scale(vcColorField.colorScale);
    return values.map((v) => colorScale.domain([min, max])(v));
  }
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

function resolveColor(
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
    const valuesColumn = table.getChild(fieldName)?.toArray() as string[];
    color = mapValuesToColors(valuesColumn, vc.color);
  } else {
    //~ color should be based on values in the 'values' array
    if (!vc.color.values) {
      return defaultColor; //~ return default color
    }
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
  const xArr = structure.structure.data.getChild("x")?.toArray();
  const yArr = structure.structure.data.getChild("y")?.toArray();
  const zArr = structure.structure.data.getChild("z")?.toArray();

  const chrColumn = structure.structure.data.getChild("chr");
  const chrArr = chrColumn ? chrColumn.toArray() as string[] : undefined;
  const idxColumn = structure.structure.data.getChild("index");
  const idxArr = idxColumn ? idxColumn.toArray() as number[] : undefined;

  const positions: vec3[] = [];
  for (let i = 0; i < structure.structure.data.numRows; i++) {
    positions.push(vec3.fromValues(xArr[i], yArr[i], zArr[i]));
  }

  //2. calculate the visual attributes based on the viewConfig
  const color = resolveColor(structure.structure.data, vc);
  const scale = resolveScale(vc);

  const segments = breakIntoContinuousSegments(
    positions,
    idxArr,
    chrArr,
    color,
    scale,
    vc.mark || "sphere",
    vc.links ?? false,
    vc.position ?? vec3.fromValues(0, 0, 0));

  renderer.addSegments(segments);
}

type SegmentData = {
  start: number;
  end: number;
}

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

  for (let cIndex = 0; cIndex < rowsNum;) {
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
      end: end
    });
    cIndex += 1;
  }

  console.log(`Found segments: ${segmentsData.length}`);
  return segmentsData;
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
  position: vec3,
): DrawableMarkSegment[] {
  console.log("breaking into segments");

  const segmentsData = computeSegments(positions.length, chromosomeColumn, indicesColumn);

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
        position: position,
      },
    };
  });

  return segments;
}
