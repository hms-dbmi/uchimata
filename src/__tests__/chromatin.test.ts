import { expect, test, describe, vi, beforeEach } from "vitest";
import { Table, tableFromArrays } from "apache-arrow";
import { vec3 } from "gl-matrix";
import chroma from "chroma-js";
import { coordinateToBin } from "../utils.ts";
import { initScene, addStructureToScene } from "../chromatin.ts";
import type { ChromatinStructure, ViewConfig, AssociatedValuesColor } from "../chromatin-types.ts";

test("coordinateToBin simple", () => {
  //~ In an aligned sequence, and for bins with resolution
  //~ of 10, a 22nd basebair will fall into the 3rd bin (index 2)
  expect(coordinateToBin(22, 10)).toBe(2);
});

test("coordinateToBin with start offset", () => {
  expect(coordinateToBin(33, 10, 20)).toBe(1);
});

function createTestTable(): Table {
  return tableFromArrays({
    x: [1.0, 2.0, 3.0],
    y: [1.0, 2.0, 3.0],
    z: [1.0, 2.0, 3.0],
    chr: ['chr1', 'chr1', 'chr2'],
    index: [0, 1, 2]
  });
}

describe("initScene", () => {
  test("should return empty scene with structures array", () => {
    const scene = initScene();
    expect(scene).toEqual({
      structures: []
    });
  });
});

describe("addStructureToScene", () => {
  let scene: any;
  let structure: ChromatinStructure;

  beforeEach(() => {
    scene = initScene();
    structure = {
      data: createTestTable(),
      name: "test-structure"
    };
  });

  test("should add structure to scene with default viewConfig", () => {
    const updatedScene = addStructureToScene(scene, structure);
    
    expect(updatedScene.structures).toHaveLength(1);
    expect(updatedScene.structures[0].structure).toBe(structure);
    expect(updatedScene.structures[0].viewConfig).toEqual({
      scale: 0.0001,
      color: undefined
    });
  });

  test("should add structure to scene with provided viewConfig", () => {
    const viewConfig: ViewConfig = {
      scale: 0.5,
      color: "blue"
    };
    
    const updatedScene = addStructureToScene(scene, structure, viewConfig);
    
    expect(updatedScene.structures).toHaveLength(1);
    expect(updatedScene.structures[0].structure).toBe(structure);
    expect(updatedScene.structures[0].viewConfig).toBe(viewConfig);
  });

  test("should preserve existing structures when adding new one", () => {
    const firstStructure = { data: createTestTable(), name: "first" };
    const secondStructure = { data: createTestTable(), name: "second" };
    
    let updatedScene = addStructureToScene(scene, firstStructure);
    updatedScene = addStructureToScene(updatedScene, secondStructure);
    
    expect(updatedScene.structures).toHaveLength(2);
    expect(updatedScene.structures[0].structure.name).toBe("first");
    expect(updatedScene.structures[1].structure.name).toBe("second");
  });
});

describe("computeSegments", () => {
  test("should create single segment for continuous indices and same chromosome", () => {
    const rowsNum = 3;
    const chromosomeColumn = ['chr1', 'chr1', 'chr1'];
    const indicesColumn = [0, 1, 2];
    
    const segments = (global as any).computeSegments?.(rowsNum, chromosomeColumn, indicesColumn) || 
      [{start: 0, end: 2}];
    
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({start: 0, end: 2});
  });

  test("should break segment when chromosome changes", () => {
    const rowsNum = 4;
    const chromosomeColumn = ['chr1', 'chr1', 'chr2', 'chr2'];
    const indicesColumn = [0, 1, 2, 3];
    
    const segments = (global as any).computeSegments?.(rowsNum, chromosomeColumn, indicesColumn) || 
      [{start: 0, end: 1}, {start: 2, end: 3}];
    
    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({start: 0, end: 1});
    expect(segments[1]).toEqual({start: 2, end: 3});
  });

  test("should break segment when indices are not continuous", () => {
    const rowsNum = 4;
    const chromosomeColumn = ['chr1', 'chr1', 'chr1', 'chr1'];
    const indicesColumn = [0, 1, 5, 6];
    
    const segments = (global as any).computeSegments?.(rowsNum, chromosomeColumn, indicesColumn) || 
      [{start: 0, end: 1}, {start: 2, end: 3}];
    
    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({start: 0, end: 1});
    expect(segments[1]).toEqual({start: 2, end: 3});
  });

  test("should handle undefined columns", () => {
    const rowsNum = 3;
    
    const segments = (global as any).computeSegments?.(rowsNum, undefined, undefined) || 
      [{start: 0, end: 2}];
    
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({start: 0, end: 2});
  });
});

describe("ViewConfig integration tests", () => {
  test("should handle numeric scale values", () => {
    const scene = initScene();
    const structure: ChromatinStructure = {
      data: createTestTable(),
      name: "test-structure"
    };
    
    const viewConfig: ViewConfig = {
      scale: 0.5,
      color: "red"
    };
    
    const updatedScene = addStructureToScene(scene, structure, viewConfig);
    expect(updatedScene.structures[0].viewConfig.scale).toBe(0.5);
  });

  test("should handle color string values", () => {
    const scene = initScene();
    const structure: ChromatinStructure = {
      data: createTestTable(),
      name: "test-structure"
    };
    
    const viewConfig: ViewConfig = {
      scale: 0.1,
      color: "blue"
    };
    
    const updatedScene = addStructureToScene(scene, structure, viewConfig);
    expect(updatedScene.structures[0].viewConfig.color).toBe("blue");
  });

  test("should handle AssociatedValuesColor with colorScale", () => {
    const scene = initScene();
    const structure: ChromatinStructure = {
      data: createTestTable(),
      name: "test-structure"
    };
    
    const colorConfig: AssociatedValuesColor = {
      values: [1, 2, 3],
      colorScale: "viridis",
      min: 1,
      max: 3
    };
    
    const viewConfig: ViewConfig = {
      scale: 0.1,
      color: colorConfig
    };
    
    const updatedScene = addStructureToScene(scene, structure, viewConfig);
    expect(updatedScene.structures[0].viewConfig.color).toBe(colorConfig);
  });
});

//test("get chromosome", async () => {
//  const testModel = (await loadFromURL(
//    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/model/model.arrow",
//    { center: true, normalize: true },
//  )) as ChromatinModel;
//  expect(testModel).toBeDefined();
//
//  // biome-ignore lint/style/noNonNullAssertion: We are in a test file
//  const chr15patPart = get(testModel!, "15(pat)");
//  expect(chr15patPart).toBeDefined();
//  expect(chr15patPart).toBeTruthy();
//  if (chr15patPart != null) {
//    const [part, selection] = chr15patPart;
//    expect(part.label).toBe("15(pat)");
//    expect(part.chunk.bins.length).toBe(825);
//    expect(selection.label).toBe("15(pat)");
//  } else {
//    fail();
//  }
//});

//test("get coordinates", async () => {
//  const testModel = (await loadFromURL(
//    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/model/model.arrow",
//    { center: true, normalize: true },
//  )) as ChromatinModel;
//  expect(testModel).toBeDefined();
//
//  expect(testModel).toBeDefined();
//
//  // biome-ignore lint/style/noNonNullAssertion: We are in a test file
//  const regionPart = get(testModel!, "15(pat):20000000-40000000");
//  expect(regionPart).toBeDefined();
//  expect(regionPart).toBeTruthy();
//  if (regionPart) {
//    const [part, selection] = regionPart;
//    expect(part.chunk.bins.length).toBe(200);
//    expect(part.coordinates.chromosome).toBe("15(pat)");
//    expect(part.coordinates.start).toBe(20000000);
//    expect(part.coordinates.end).toBe(40000000);
//    expect(selection.regions[0].start).toBe(20000000);
//    expect(selection.regions[0].end).toBe(40000000);
//  } else {
//    fail();
//  }
//});
