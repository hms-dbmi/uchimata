import type { Table } from "apache-arrow";

/**
 *
 * Very simple cross-section of a model to test out filtering of the Arrow Table via duckdb
 */
function crosssection(model: Table, cutAt: number): Table {

  console.log(`filtering model: cross-section at ${cutAt}`);

  return model;
}

/**
 * Query for model parts on specified genomic coordinates
 * @param coordinates, e.g., "chr1" or "chr1:10000000-12000000" (chromosome annotation is linked to what's in ChromatinPart.label
 * @returns chromatin part, i.e., bins corresponding to the genomic coordinates
 */
export function get(model: Table, coordinates: string): Table | null {
  console.warn("not implemented: get() for selections.ts");
  console.log(model);
  console.log(coordinates);

  const cutAt = 0;
  return crosssection(model, cutAt);
}
