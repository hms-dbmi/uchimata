import { tableToIPC, type Table } from "apache-arrow";
//import * as duckdb from '@duckdb/duckdb-wasm';
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';


async function initializeDuckDB(): Promise<duckdb.AsyncDuckDB> {
  // Initialize DuckDB
  console.log("Initializing DuckDB...");
  const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
      mainModule: duckdb_wasm,
      mainWorker: mvp_worker,
    },
    eh: {
      mainModule: duckdb_wasm_eh,
      mainWorker: eh_worker,
    },
  };

  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  return db;
}

export async function testQuery(db: duckdb.AsyncDuckDB) {
  // Create a connection
  const conn = await db.connect();

  // Execute SQL queries
  await conn.query(`
  CREATE TABLE users (
    id INTEGER,
    name VARCHAR,
    email VARCHAR
  )
`);

  // Insert data
  await conn.query(`
  INSERT INTO users VALUES
    (1, 'Alice', 'alice@example.com'),
    (2, 'Bob', 'bob@example.com')
`);

  // Query data
  const result = await conn.query('SELECT * FROM users');
  console.log("Query result:");
  console.log(result.toArray());
  for (const row of result) {
    console.log(`ID: ${row.id}, Name: ${row.name}, Email: ${row.email}`);
  }

  // Clean up
  await conn.close();
  await db.terminate();
}

export async function makeCuttingPlane(
  model: Table,
  db: duckdb.AsyncDuckDB
): Promise<Table | null> {
  // Create a connection
  const conn = await db.connect();

  //conn.insertArrowTable(model, { name: "structure" });
  conn.insertArrowFromIPCStream(tableToIPC(model), { name: "structure" });

  const result = await conn.query('SELECT * FROM structure WHERE z < 0');
  const ipc = tableToIPC(result);
  return result;
}

/**
 * Query for model parts on specified genomic coordinates
 * @param coordinates, e.g., "chr1" or "chr1:10000000-12000000" (chromosome annotation is linked to what's in ChromatinPart.label
 * @returns chromatin part, i.e., bins corresponding to the genomic coordinates
 */
export async function get(model: Table, coordinates: string): Promise<Table | null> {
  console.warn("not implemented: get() for selections.ts");
  console.log(model);
  console.log(coordinates);

  const db = await initializeDuckDB();
  await testQuery(db);
  return null;
}
