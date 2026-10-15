import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, type PoolClient } from "pg";
import type { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

type Connection = DatabaseSync | PoolClient;
export class DatabaseDriver {
  private context = new AsyncLocalStorage<Connection>();
  private queue: Promise<void> = Promise.resolve();
  private constructor(private sqlite?: DatabaseSync, private pool?: Pool) {}
  static async open(sqlitePath: string): Promise<DatabaseDriver> {
    if (process.env.DATABASE_URL && process.env.NODE_ENV !== "test") {
      return new DatabaseDriver(undefined, new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }));
    }
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production; SQLite is for development only");
    if (sqlitePath !== ":memory:") fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
    const { DatabaseSync } = await import("node:sqlite");
    const sqlite = new DatabaseSync(sqlitePath);
    sqlite.exec("PRAGMA foreign_keys = ON");
    if (sqlitePath !== ":memory:") sqlite.exec("PRAGMA journal_mode = WAL");
    return new DatabaseDriver(sqlite);
  }
  private async lock<T>(operation: () => Promise<T>): Promise<T> {
    const before = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>(resolve => { release = resolve; });
    await before;
    try { return await operation(); } finally { release(); }
  }
  private sql(sql: string): string {
    if (!this.pool) return sql;
    let position = 0;
    return sql.replace(/\?/g, () => `$${++position}`).replace(/INTEGER NOT NULL DEFAULT 0/g, "BIGINT NOT NULL DEFAULT 0");
  }
  private async query(sql: string, args: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; changes: number }> {
    const run = async (connection: Connection) => {
      if (this.pool) {
        const result = await (connection as PoolClient).query(this.sql(sql), args);
        return { rows: result.rows, changes: result.rowCount || 0 };
      }
      const stmt = (connection as DatabaseSync).prepare(sql);
      if (/^\s*(SELECT|WITH)|\bRETURNING\b/i.test(sql)) return { rows: stmt.all(...args as (string | number | null)[]) as Record<string, unknown>[], changes: 0 };
      const result = stmt.run(...args as (string | number | null)[]);
      return { rows: [], changes: Number(result.changes) };
    };
    const current = this.context.getStore();
    if (current) return run(current);
    if (this.pool) {
      const client = await this.pool.connect();
      try { return await run(client); } finally { client.release(); }
    }
    return this.lock(() => run(this.sqlite!));
  }
  prepare(sql: string) {
    return {
      get: async (...args: unknown[]) => (await this.query(sql, args)).rows[0],
      all: async (...args: unknown[]) => (await this.query(sql, args)).rows,
      run: async (...args: unknown[]) => ({ changes: (await this.query(sql, args)).changes }),
    };
  }
  async exec(sql: string): Promise<void> {
    for (const statement of sql.split(";").map(value => value.trim()).filter(Boolean)) await this.query(statement);
  }
  async transaction<T>(operation: () => Promise<T>): Promise<T> {
    if (this.context.getStore()) return operation();
    const run = async (connection: Connection) => this.context.run(connection, async () => {
      await this.exec(this.pool ? "BEGIN" : "BEGIN IMMEDIATE");
      try { const value = await operation(); await this.exec("COMMIT"); return value; }
      catch (error) { await this.exec("ROLLBACK"); throw error; }
    });
    if (this.pool) {
      const client = await this.pool.connect();
      try { return await run(client); } finally { client.release(); }
    }
    return this.lock(() => run(this.sqlite!));
  }
  async lockOrder(id: string): Promise<void> {
    if (this.pool) await this.prepare("SELECT id FROM orders WHERE id = ? FOR UPDATE").get(id);
  }
  async close(): Promise<void> { if (this.pool) await this.pool.end(); else this.sqlite?.close(); }
}
