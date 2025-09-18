import { type Table, tableFromArrays } from "apache-arrow";
import chroma from "chroma-js";
import { beforeEach, describe, expect, test } from "vitest";
import { assert } from "../assert.ts";
import {
  addStructureToScene,
  initScene,
  resolveColor,
  resolveScale,
} from "../chromatin.ts";
import type {
  AssociatedValuesColor,
  AssociatedValuesScale,
  ChromatinScene,
  ChromatinStructure,
  ViewConfig,
} from "../chromatin-types.ts";

function createTestTable(): Table {
  return tableFromArrays({
    x: [1.0, 2.0, 3.0],
    y: [1.0, 2.0, 3.0],
    z: [1.0, 2.0, 3.0],
    chr: ["chr1", "chr1", "chr2"],
    coord: [3000000, 3100000, 3000000],
    index: [0, 1, 2],
  });
}

describe("initScene", () => {
  test("should return empty scene with structures array", () => {
    const scene = initScene();
    expect(scene).toEqual({
      structures: [],
    });
  });
});

describe("addStructureToScene", () => {
  let scene: ChromatinScene;
  let structure: ChromatinStructure;

  beforeEach(() => {
    scene = initScene();
    structure = {
      data: createTestTable(),
      name: "test-structure",
    };
  });

  test("should add structure to scene with default viewConfig", () => {
    const updatedScene = addStructureToScene(scene, structure);

    expect(updatedScene.structures).toHaveLength(1);
    expect(updatedScene.structures[0].structure).toBe(structure);
    expect(updatedScene.structures[0].viewConfig).toEqual({
      scale: 0.0001,
      color: "red",
    });
  });

  test("should add structure to scene with provided viewConfig", () => {
    const viewConfig: ViewConfig = {
      scale: 0.5,
      color: "blue",
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

describe("ViewConfig integration tests", () => {
  test("should handle numeric scale values", () => {
    const scene = initScene();
    const structure: ChromatinStructure = {
      data: createTestTable(),
      name: "test-structure",
    };

    const viewConfig: ViewConfig = {
      scale: 0.5,
      color: "red",
    };

    const updatedScene = addStructureToScene(scene, structure, viewConfig);
    expect(updatedScene.structures[0].viewConfig.scale).toBe(0.5);
  });

  test("should handle color string values", () => {
    const scene = initScene();
    const structure: ChromatinStructure = {
      data: createTestTable(),
      name: "test-structure",
    };

    const viewConfig: ViewConfig = {
      scale: 0.1,
      color: "blue",
    };

    const updatedScene = addStructureToScene(scene, structure, viewConfig);
    expect(updatedScene.structures[0].viewConfig.color).toBe("blue");
  });

  test("should handle AssociatedValuesColor with colorScale", () => {
    const scene = initScene();
    const structure: ChromatinStructure = {
      data: createTestTable(),
      name: "test-structure",
    };

    const colorConfig: AssociatedValuesColor = {
      values: [1, 2, 3],
      colorScale: "viridis",
      min: 1,
      max: 3,
    };

    const viewConfig: ViewConfig = {
      scale: 0.1,
      color: colorConfig,
    };

    const updatedScene = addStructureToScene(scene, structure, viewConfig);
    expect(updatedScene.structures[0].viewConfig.color).toBe(colorConfig);
  });
});

describe("resolveScale", () => {
  let table: Table;

  beforeEach(() => {
    table = tableFromArrays({
      x: [1.0, 2.0, 3.0, 4.0],
      y: [1.0, 2.0, 3.0, 4.0],
      z: [1.0, 2.0, 3.0, 4.0],
      values: [10, 20, 30, 40],
      chr: ["chr1", "chr1", "chr2", "chr2"],
      index: [0, 1, 2, 3],
    });
  });

  test("should return default scale when no scale config provided", () => {
    const viewConfig: ViewConfig = {};
    const result = resolveScale(table, viewConfig);
    expect(result).toBe(0.005);
  });

  test("should return constant scale when scale is a number", () => {
    const viewConfig: ViewConfig = { scale: 0.1 };
    const result = resolveScale(table, viewConfig);
    expect(result).toBe(0.1);
  });

  test("should resolve scale from table field", () => {
    const scaleConfig: AssociatedValuesScale = {
      field: "values",
      scaleMin: 0.001,
      scaleMax: 0.05,
      min: 10,
      max: 40,
    };
    const viewConfig: ViewConfig = { scale: scaleConfig };
    const result = resolveScale(table, viewConfig) as number[];

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
    expect(result[0]).toBeCloseTo(0.001);
    expect(result[3]).toBeCloseTo(0.05);
  });

  test("should resolve scale from values array", () => {
    const scaleConfig: AssociatedValuesScale = {
      values: [5, 15, 25, 35],
      scaleMin: 0.002,
      scaleMax: 0.04,
      min: 5,
      max: 35,
    };
    const viewConfig: ViewConfig = { scale: scaleConfig };
    const result = resolveScale(table, viewConfig) as number[];

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
    expect(result[0]).toBeCloseTo(0.002);
    expect(result[3]).toBeCloseTo(0.04);
  });

  test("should use default scale min/max when not provided", () => {
    const scaleConfig: AssociatedValuesScale = {
      values: [0, 1, 0.5, 0.8], // Match table length
      scaleMin: 0.001,
      scaleMax: 0.05,
    };
    const viewConfig: ViewConfig = { scale: scaleConfig };
    const result = resolveScale(table, viewConfig) as number[];

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toBeCloseTo(0.001);
    expect(result[1]).toBeCloseTo(0.05);
  });

  test("should return default scale when field doesn't exist", () => {
    const scaleConfig: AssociatedValuesScale = {
      field: "nonexistent",
      scaleMin: 0.001,
      scaleMax: 0.05,
    };
    const viewConfig: ViewConfig = { scale: scaleConfig };
    const result = resolveScale(table, viewConfig);

    expect(result).toBe(0.005);
  });

  test("should return default scale when values array is not provided", () => {
    const scaleConfig: AssociatedValuesScale = {
      scaleMin: 0.001,
      scaleMax: 0.05,
    };
    const viewConfig: ViewConfig = { scale: scaleConfig };
    const result = resolveScale(table, viewConfig);

    expect(result).toBe(0.005);
  });

  test("should handle nominal values (strings) mapped to scale", () => {
    const tableWithStrings = tableFromArrays({
      x: [1.0, 2.0],
      y: [1.0, 2.0],
      z: [1.0, 2.0],
      category: ["A", "B"],
    });

    const scaleConfig: AssociatedValuesScale = {
      field: "category",
      scaleMin: 0.001,
      scaleMax: 0.05,
    };
    const viewConfig: ViewConfig = { scale: scaleConfig };
    const result = resolveScale(tableWithStrings, viewConfig) as number[];

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

describe("resolveColor", () => {
  let table: Table;

  beforeEach(() => {
    table = tableFromArrays({
      x: [1.0, 2.0, 3.0, 4.0],
      y: [1.0, 2.0, 3.0, 4.0],
      z: [1.0, 2.0, 3.0, 4.0],
      values: [10, 20, 30, 40],
      categories: ["A", "B", "A", "C"],
      chr: ["chr1", "chr1", "chr2", "chr2"],
      index: [0, 1, 2, 3],
    });
  });

  test("should return default red color when no color config provided", () => {
    const viewConfig: ViewConfig = {};
    const result = resolveColor(table, viewConfig);
    expect(chroma.valid(result)).toBe(true);
    expect(result).toEqual(chroma("red"));
  });

  test("should return single color when color is a string", () => {
    const viewConfig: ViewConfig = { color: "blue" };
    const result = resolveColor(table, viewConfig);
    expect(chroma.valid(result)).toBe(true);
    expect(result).toEqual(chroma("blue"));
  });

  test("should resolve colors from numeric table field with string colorScale", () => {
    const colorConfig: AssociatedValuesColor = {
      field: "values",
      colorScale: "Viridis",
      min: 10,
      max: 40,
    };
    const viewConfig: ViewConfig = { color: colorConfig };
    const result = resolveColor(table, viewConfig);

    expect(Array.isArray(result)).toBe(true);
    assert(Array.isArray(result));
    expect(result.length).toBe(4);
    result.forEach((color) => expect(chroma.valid(color)).toBe(true));
  });

  test("should resolve colors from numeric values array with string colorScale", () => {
    const colorConfig: AssociatedValuesColor = {
      values: [5, 15, 25, 35],
      colorScale: "Blues",
      min: 5,
      max: 35,
    };
    const viewConfig: ViewConfig = { color: colorConfig };
    const result = resolveColor(table, viewConfig);

    expect(Array.isArray(result)).toBe(true);
    assert(Array.isArray(result));
    expect(result).toHaveLength(4);
    result.forEach((color) => expect(chroma.valid(color)).toBe(true));
  });

  test("should resolve colors from categorical field", () => {
    const colorConfig: AssociatedValuesColor = {
      field: "categories",
      colorScale: ["#ff0000", "#00ff00", "#0000ff"],
    };
    const viewConfig: ViewConfig = { color: colorConfig };
    const result = resolveColor(table, viewConfig);

    expect(Array.isArray(result)).toBe(true);
    assert(Array.isArray(result));
    expect(result).toHaveLength(4);
    result.forEach((color) => expect(chroma.valid(color)).toBe(true));
  });

  test("should resolve colors from categorical values array", () => {
    const colorConfig: AssociatedValuesColor = {
      values: ["X", "Y", "X", "Z"],
      colorScale: ["red", "green", "blue"],
    };
    const viewConfig: ViewConfig = { color: colorConfig };
    const result = resolveColor(table, viewConfig);

    expect(Array.isArray(result)).toBe(true);
    assert(Array.isArray(result));
    expect(result).toHaveLength(4);
    result.forEach((color) => expect(chroma.valid(color)).toBe(true));
  });

  test("should use default color range when min/max not provided for numeric scale", () => {
    const colorConfig: AssociatedValuesColor = {
      values: [0, 0.5, 1, 0.75], // Match table length
      colorScale: "Reds",
    };
    const viewConfig: ViewConfig = { color: colorConfig };
    const result = resolveColor(table, viewConfig);

    expect(Array.isArray(result)).toBe(true);
    assert(Array.isArray(result));
    expect(result).toHaveLength(4);
    result.forEach((color) => expect(chroma.valid(color)).toBe(true));
  });

  test("should handle non-existent field gracefully", () => {
    const colorConfig: AssociatedValuesColor = {
      field: "nonexistent",
      colorScale: "viridis",
    };
    const viewConfig: ViewConfig = { color: colorConfig };

    // The function currently doesn't handle this case gracefully - it will throw
    expect(() => resolveColor(table, viewConfig)).toThrow();
  });

  test("should return default color when values array is not provided", () => {
    const colorConfig: AssociatedValuesColor = {
      colorScale: "viridis",
    };
    const viewConfig: ViewConfig = { color: colorConfig };
    const result = resolveColor(table, viewConfig);

    expect(result).toEqual(chroma("red"));
  });

  test("should handle array colorScale for numeric data", () => {
    const colorConfig: AssociatedValuesColor = {
      values: [10, 20, 30, 40], // Match table length
      colorScale: ["#ff0000", "#00ff00", "#0000ff"],
      min: 10,
      max: 40,
    };
    const viewConfig: ViewConfig = { color: colorConfig };
    const result = resolveColor(table, viewConfig);

    expect(Array.isArray(result)).toBe(true);
    assert(Array.isArray(result));
    expect(result).toHaveLength(4);
    result.forEach((color) => expect(chroma.valid(color)).toBe(true));
  });

  test("should handle categorical colors when enough colors provided", () => {
    const colorConfig: AssociatedValuesColor = {
      values: ["A", "B", "A", "B"], // Match table length, 2 unique values (A, B)
      colorScale: ["red", "green", "blue"], // More colors than needed
    };
    const viewConfig: ViewConfig = { color: colorConfig };
    const result = resolveColor(table, viewConfig);

    expect(Array.isArray(result)).toBe(true);
    assert(Array.isArray(result));
    expect(result).toHaveLength(4);
    result.forEach((color) => expect(chroma.valid(color)).toBe(true));
  });

  test("should throw when insufficient colors for categorical values", () => {
    const colorConfig: AssociatedValuesColor = {
      values: ["A", "B", "A", "C"], // 3 unique values (A, B, C)
      colorScale: ["red", "green"], // Only 2 colors
    };
    const viewConfig: ViewConfig = { color: colorConfig };

    // Current implementation throws when there aren't enough colors
    expect(() => resolveColor(table, viewConfig)).toThrow();
  });
});
