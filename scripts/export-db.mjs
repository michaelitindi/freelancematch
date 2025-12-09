import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'freelancematch.db');
const db = new Database(dbPath);

// Get schema
const tables = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

let sql = '';

// Add schema
tables.forEach(table => {
  if (table.sql) {
    sql += table.sql + ';\n\n';
  }
});

// Get all table names
const tableNames = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

// Export data
tableNames.forEach(({ name }) => {
  const rows = db.prepare(`SELECT * FROM ${name}`).all();
  
  rows.forEach(row => {
    const columns = Object.keys(row);
    const values = columns.map(col => {
      const val = row[col];
      if (val === null) return 'NULL';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    });
    
    sql += `INSERT INTO ${name} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
  });
  
  sql += '\n';
});

fs.writeFileSync(path.join(__dirname, '..', 'migration.sql'), sql);
console.log('✅ Database exported to migration.sql');
console.log(`📊 ${tableNames.length} tables exported`);

db.close();
