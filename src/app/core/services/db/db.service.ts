import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
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
      if(Capacitor.isNativePlatform()){
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
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  async query(query, value = []) {
    if(Capacitor.isNativePlatform()){
      const res = await this.db.executeSql(query, value);
      const data = [];
      // CREATE ARRAY OF ALL ROWS
      for (let index = 0; index < res.rows.length; index++) {
        const element = res.rows.item([index]);
        data.push(element);
      }
      return data;
    }
    return null
  }

  store(insertQuery, value) {
    if(Capacitor.isNativePlatform()){
      return this.db.executeSql(insertQuery, value);
    }
    return null
  }
}
