import { type Table, tableToIPC } from "apache-arrow";
import { DuckDBSingleton } from "./DuckDBClient";

const duckDB = new DuckDBSingleton();

/**
 * Creates a cutting plane through the model at the specified axis and cut position.
 */
export async function makeCuttingPlane(
  model: Table,
  axis: "x" | "y" | "z" = "x",
  cutAt = 0,
): Promise<Table> {
  //~ This is probably not the most efficient way to do this, but it works for now.
  const db = await duckDB.getDatabase();
  const conn = await db.connect();
  conn.insertArrowFromIPCStream(tableToIPC(model), { name: "structure" });

  const query = `SELECT * FROM structure WHERE ${axis} < ${cutAt}`;

  return await duckDB.query(query);
}

/**
 * Selects a chromosome from the structure table based on the specified chromosome name.
 * @param chromName - The name of the chromosome to select.
 * @param column - The column to filter by (default is "chr").
 *
 */
export async function selectChromosome(
  model: Table,
  chromName: string,
  column = "chr",
): Promise<Table> {
  //~ This is probably not the most efficient way to do this, but it works for now.
  const db = await duckDB.getDatabase();
  const conn = await db.connect();
  conn.insertArrowFromIPCStream(tableToIPC(model), { name: "structure" });

  const query = `SELECT * FROM structure WHERE ${column} ='${chromName}'`;
  console.log(`query: ${query}`);

  //console.warn("not implemented: selectChromosome() for selections.ts");
  //return null;
  return await duckDB.query(query);
}
