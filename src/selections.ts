import type { Table } from "apache-arrow";

import * as arrow from 'apache-arrow';
import duckdbInit from '@duckdb/duckdb-wasm';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';

/**
 *
 * Very simple cross-section of a model to test out filtering of the Arrow Table via duckdb
 */
async function crosssection(model: Table, cutAt: number): Promise<Table> {


  // Select WASM bundle (Node.js: use `duckdb-node.wasm` or similar)
  const DUCKDB_BUNDLES = await duckdbInit.selectBundle({
    // Use this for browser-safe, fallback setup
    mvp: await duckdbInit.getJsDelivrBundles().then(b => b.find(b => b.bundle === 'mvp')),
  });
  const db = new AsyncDuckDB(DUCKDB_BUNDLES.mainModule, DUCKDB_BUNDLES.mainWorker);
  await db.instantiate();
  const conn = await db.connect();

  // Create an Arrow table
  const table = arrow.tableFromArrays({
    name: ['Alice', 'Bob', 'Charlie'],
    age: [25, 30, 22],
  });

  // Insert + Query
  await conn.insertArrowTable(table, { name: 'people' });
  const result = await conn.queryArrow('SELECT * FROM people WHERE age > 24');

  // Log results
  for (const row of result) {
    console.log(row);
  }

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
