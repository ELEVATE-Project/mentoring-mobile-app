import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  readonly db_name: string = environment.sqliteDBName;
  private db: SQLiteObject;

  constructor(private sqlite: SQLite) {
  }

  async init() {
    try {
      this.db = await this.sqlite.create({
        name: this.db_name,
        location: 'default',
      });
      this.db
        .executeSql(
          'CREATE TABLE IF NOT EXISTS forms(primary_key PRIMARY KEY,form,ttl)',
          []
        ) // CREATE ALL REQUIRED TABLES HERE
        .then(() => console.log('Executed SQL'))
        .catch((e) => console.log(e));
      console.log(this.db);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  async query(query, value = []) {
    const res = await this.db.executeSql(query, value);
    const data = [];
    // CREATE ARRAY OF ALL ROWS
    for (let index = 0; index < res.rows.length; index++) {
      const element = res.rows.item([index]);
      data.push(element);
    }
    return data;
  }

  store(insertQuery, value) {
    return this.db.executeSql(insertQuery, value);
  }
}
