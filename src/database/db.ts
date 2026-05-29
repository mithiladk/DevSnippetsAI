import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("devsnippets.db");

export function initDatabase(): void {
  db.execSync(`
        CREATE TABLE IF NOT EXISTS snippets (
      id TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      code          TEXT NOT NULL,
      language      TEXT NOT NULL,
      tags          TEXT NOT NULL,
      isFavorite    INTEGER NOT NULL DEFAULT 0,
      createdAt     INTEGER NOT NULL,
      updatedAt     INTEGER NOT NULL,
      screenshotUri TEXT,
      aiExplanation TEXT
        
        )
        
        `);
  console.log(`[DB] database ready`);
}

export default db;
