import { vec3 } from "gl-matrix";

export type LoadOptions = {
  center?: boolean;
  normalize?: boolean;
};

export const recenter = (originalPositions: vec3[]): vec3[] => {
  const positions = originalPositions;

  const bbMax = positions.reduce(
    (a, b) => vec3.max(vec3.create(), a, b),
    vec3.fromValues(
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ),
  );
  const bbMin = positions.reduce(
    (a, b) => vec3.min(vec3.create(), a, b),
    vec3.fromValues(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    ),
  );
  const bbCenter = vec3.scale(
    vec3.create(),
    vec3.add(vec3.create(), bbMax, bbMin),
    0.5,
  );
  const positionsCentered = positions.map((a) =>
    vec3.sub(vec3.create(), a, bbCenter),
  );

  return positionsCentered;
};

export const normalize = (positions: vec3[], factor?: number): vec3[] => {
  const scaleFactor =
    factor === undefined ? computeNormalizationFactor(positions) : factor;

  const positionsNormalized = positions.map((p) =>
    vec3.scale(p, p, scaleFactor),
  );

  return positionsNormalized;
};

export const computeNormalizationFactor = (positions: vec3[]): number => {
  const bbMax = positions.reduce(
    (a, b) => vec3.max(vec3.create(), a, b),
    vec3.fromValues(
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ),
  );
  const bbMin = positions.reduce(
    (a, b) => vec3.min(vec3.create(), a, b),
    vec3.fromValues(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    ),
  );
  const bbCenter = vec3.scale(
    vec3.create(),
    vec3.add(vec3.create(), bbMax, bbMin),
    0.5,
  );
  console.log(bbCenter);
  const bbSides = vec3.sub(vec3.create(), bbMax, bbMin);
  const maxDim = Math.max(...bbSides);
  const scaleFactor = 1 / maxDim;

  return scaleFactor;
};
