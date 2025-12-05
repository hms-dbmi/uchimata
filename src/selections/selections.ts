import { type Table, tableToIPC } from "@uwdata/flechette";
import { assert } from "../assert";
import { DuckDBSingleton } from "./DuckDBClient";

const duckDB = new DuckDBSingleton();

/**
 * Filters the chromatin structure using a cutting plane perpendicular to a specified axis.
 *
 * @param model - The chromatin structure data table to filter
 * @param axis - The axis perpendicular to the cutting plane ("x", "y", or "z"). Default: "x"
 * @param cutAt - The position along the axis where to place the cutting plane. Default: 0
 * @param invert - If false, keeps data where axis < cutAt; if true, keeps data where axis > cutAt. Default: false
 * @returns Promise resolving to a filtered Table
 * @example
 * const filtered = await makeCuttingPlane(structure.data, "z", 0.5, false);
 */
export async function makeCuttingPlane(
  model: Table,
  axis: "x" | "y" | "z" = "x",
  cutAt = 0,
  invert = false,
): Promise<Table> {
  if (!(await duckDB.getExistingTables()).includes("structure")) {
    const db = await duckDB.getDatabase();
    const conn = await db.connect();
    const tableAsIPC = tableToIPC(model, {});
    assert(tableAsIPC, "Failed to convert model to IPC format");
    conn.insertArrowFromIPCStream(tableAsIPC, { name: "structure" });
  }

  const query = invert
    ? `SELECT * FROM structure WHERE ${axis} > ${cutAt}`
    : `SELECT * FROM structure WHERE ${axis} < ${cutAt}`;

  return await duckDB.query(query);
}

/**
 * Filters the chromatin structure to include only a specific chromosome.
 *
 * @param model - The chromatin structure data table to filter
 * @param chromName - The name of the chromosome to select (e.g., "chr1", "chrX")
 * @param column - The column name containing chromosome identifiers. Default: "chr"
 * @returns Promise resolving to a filtered Table containing only the specified chromosome
 * @example
 * const chr1 = await selectChromosome(structure.data, "chr1");
 */
export async function selectChromosome(
  model: Table,
  chromName: string,
  column = "chr",
): Promise<Table> {
  if (!(await duckDB.getExistingTables()).includes("structure")) {
    const db = await duckDB.getDatabase();
    const conn = await db.connect();
    const tableAsIPC = tableToIPC(model, {});
    assert(tableAsIPC, "Failed to convert model to IPC format");
    conn.insertArrowFromIPCStream(tableAsIPC, { name: "structure" });
  }

  const query = `SELECT * FROM structure WHERE ${column} ='${chromName}'`;
  console.log(`query: ${query}`);

  return await duckDB.query(query);
}

/**
 * Filters the chromatin structure to a specific genomic range on a chromosome.
 *
 * @param model - The chromatin structure data table to filter
 * @param chromName - The chromosome name (e.g., "chr1", "chrX")
 * @param start - The start coordinate of the genomic range (inclusive)
 * @param end - The end coordinate of the genomic range (inclusive)
 * @param chromColumn - The column name containing chromosome identifiers. Default: "chr"
 * @param coordinateColumn - The column name containing genomic coordinates. Default: "coord"
 * @returns Promise resolving to a filtered Table containing only the specified range
 * @example
 * const region = await selectRange(structure.data, "chr1", 1000000, 2000000);
 */
export async function selectRange(
  model: Table,
  chromName: string,
  start: number,
  end: number,
  chromColumn = "chr",
  coordinateColumn = "coord",
): Promise<Table> {
  if (!(await duckDB.getExistingTables()).includes("structure")) {
    const db = await duckDB.getDatabase();
    const conn = await db.connect();
    const tableAsIPC = tableToIPC(model, {});
    assert(tableAsIPC, "Failed to convert model to IPC format");
    conn.insertArrowFromIPCStream(tableAsIPC, { name: "structure" });
  }

  const query = `SELECT * FROM structure WHERE ${chromColumn} ='${chromName}' AND ${coordinateColumn} >= ${start} AND ${coordinateColumn} <= ${end}`;
  console.log(`query: ${query}`);

  return await duckDB.query(query);
}

/**
 * Filters the chromatin structure to include only points within a sphere in 3D space.
 *
 * @param model - The chromatin structure data table to filter
 * @param x - X coordinate of the sphere center
 * @param y - Y coordinate of the sphere center
 * @param z - Z coordinate of the sphere center
 * @param radius - Radius of the selection sphere
 * @returns Promise resolving to a filtered Table containing only points within the sphere
 * @example
 * const selection = await sphereSelect(structure.data, 0, 0, 0, 0.5);
 */
export async function sphereSelect(
  model: Table,
  x: number,
  y: number,
  z: number,
  radius: number,
): Promise<Table> {
  if (!(await duckDB.getExistingTables()).includes("structure")) {
    const db = await duckDB.getDatabase();
    const conn = await db.connect();
    const tableAsIPC = tableToIPC(model, {});
    assert(tableAsIPC, "Failed to convert model to IPC format");
    conn.insertArrowFromIPCStream(tableAsIPC, { name: "structure" });
  }

  const query = `SELECT * FROM structure WHERE POWER(x - ${x}, 2) + POWER(y - ${y}, 2) + POWER(z - ${z}, 2) <= POWER(${radius}, 2)`;
  console.log(`query: ${query}`);

  return await duckDB.query(query);
  // SELECT * FROM stevens WHERE POWER(x - ?, 2) + POWER(y - ?, 2) + POWER(z - ?, 2) <= POWER(?, 2);
  //
}
