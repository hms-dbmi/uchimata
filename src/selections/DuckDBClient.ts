import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import * as duckdb from "@duckdb/duckdb-wasm";

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
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
      );
      if (!bundle.mainWorker) {
        throw new Error("DuckDB bundle does not contain a main worker");
      }
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
