import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import * as duckdb from "@duckdb/duckdb-wasm";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";

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
      if (!bundle.mainWorker) {
        throw new Error("DuckDB bundle does not contain a main worker");
      }
      const worker = new Worker(bundle.mainWorker);
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

  async query(sql: string) {
    const db = await this.getDatabase();
    const conn = await db.connect();
    try {
      const result = await conn.query(sql);
      return result;
    } finally {
      await conn.close();
    }
  }

  async getExistingTables(): Promise<string[]> {
    const result = await this.query("SHOW TABLES");
    return result.toArray().map(row => row.name);
  }

  async terminate() {
    if (this.db) {
      await this.db.terminate();
      this.db = null;
      this.initPromise = null;
    }
  }
}
