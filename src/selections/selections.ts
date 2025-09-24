import { type Table, tableToIPC } from "@uwdata/flechette";
import { DuckDBSingleton } from "./DuckDBClient";

const duckDB = new DuckDBSingleton();

/**
 * Creates a cutting plane through the model at the specified axis and cut position.
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
    conn.insertArrowFromIPCStream(tableToIPC(model), { name: "structure" });
  }

  const query = invert
    ? `SELECT * FROM structure WHERE ${axis} > ${cutAt}`
    : `SELECT * FROM structure WHERE ${axis} < ${cutAt}`;

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
  if (!(await duckDB.getExistingTables()).includes("structure")) {
    const db = await duckDB.getDatabase();
    const conn = await db.connect();
    conn.insertArrowFromIPCStream(tableToIPC(model), { name: "structure" });
  }

  const query = `SELECT * FROM structure WHERE ${column} ='${chromName}'`;
  console.log(`query: ${query}`);

  return await duckDB.query(query);
}

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
    conn.insertArrowFromIPCStream(tableToIPC(model), { name: "structure" });
  }

  const query = `SELECT * FROM structure WHERE ${chromColumn} ='${chromName}' AND ${coordinateColumn} >= ${start} AND ${coordinateColumn} <= ${end}`;
  console.log(`query: ${query}`);

  return await duckDB.query(query);
}

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
    conn.insertArrowFromIPCStream(tableToIPC(model), { name: "structure" });
  }

  const query = `SELECT * FROM structure WHERE POWER(x - ${x}, 2) + POWER(y - ${y}, 2) + POWER(z - ${z}, 2) <= POWER(${radius}, 2)`;
  console.log(`query: ${query}`);

  return await duckDB.query(query);
  // SELECT * FROM stevens WHERE POWER(x - ?, 2) + POWER(y - ?, 2) + POWER(z - ?, 2) <= POWER(?, 2);
  //
}
