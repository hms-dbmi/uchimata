import { vec3 } from "gl-matrix";
import { describe, expect, test } from "vitest";
import { computeNormalizationFactor, recenter } from "../data-loaders/loader-utils";

describe("loader-utils bounding box calculations", () => {
  test("recenters coordinates correctly when all coordinates are negative", () => {
    const positions = [
      vec3.fromValues(-5, -4, -3),
      vec3.fromValues(-3, -2, -1),
    ];

    const centered = recenter(positions);

    expect(Array.from(centered[0])).toEqual([-1, -1, -1]);
    expect(Array.from(centered[1])).toEqual([1, 1, 1]);
  });

  test("computes normalization factor from the real max bounds for negative coordinates", () => {
    const positions = [
      vec3.fromValues(-5, -4, -3),
      vec3.fromValues(-3, -2, -1),
    ];

    expect(computeNormalizationFactor(positions)).toBeCloseTo(0.5);
  });
});
