import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import * as duckdb from "@duckdb/duckdb-wasm";
import { tableFromIPC } from "@uwdata/flechette";

function getArrowIPC(
  con: duckdb.AsyncDuckDBConnection,
  query: string,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    con.useUnsafe(async (bindings, conn) => {
      try {
        const buffer = await bindings.runQuery(conn, query);
        resolve(buffer);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export class DuckDBSingleton {
  db: AsyncDuckDB | null;
  initPromise: Promise<AsyncDuckDB> | null;

  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      if (this.db) return this.db;

      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
      if (!bundle.mainWorker) {
        throw new Error("DuckDB bundle does not contain a main worker");
      }
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: "text/javascript",
        }),
      );
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();

      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);

      return this.db;
    })();

    return this.initPromise;
  }

  async getDatabase() {
    return await this.initialize();
  }

  //~ Sidesteps the use of apache-arrow, uses flechette instead.
  //~ Pretty much copied from: https://github.com/uwdata/mosaic/pull/480
  async query(sql: string) {
    const db = await this.getDatabase();
    const conn = await db.connect();
    const result = await getArrowIPC(conn, sql);
    return tableFromIPC(result);
  }

  async getExistingTables(): Promise<string[]> {
    const result = await this.query("SHOW TABLES");
    return result.toArray().map((row) => row.name);
  }

  async terminate() {
    if (this.db) {
      await this.db.terminate();
      this.db = null;
      this.initPromise = null;
    }
  }
}
