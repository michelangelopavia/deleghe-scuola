const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Wrapper per sqlite3 che fornisce un'API simile a better-sqlite3
 * Il database gira in modalità serializzata per evitare problemi di concorrenza
 */

class Database {
  constructor(filepath) {
    this.db = new sqlite3.Database(filepath);
    // Serializzato: una query alla volta
    this.db.configure('busyTimeout', 5000);
  }

  /**
   * Esegue una query (INSERT, UPDATE, DELETE)
   * Ritorna {changes: numero di righe modificate}
   */
  prepare(sql) {
    return {
      run: (...params) => {
        return new Promise((resolve, reject) => {
          this.db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          });
        });
      },
      get: (...params) => {
        return new Promise((resolve, reject) => {
          this.db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
          });
        });
      },
      all: (...params) => {
        return new Promise((resolve, reject) => {
          this.db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      }
    };
  }

  /**
   * Eseguisce comando SQL grezzo (per CREATE TABLE, etc)
   */
  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;
