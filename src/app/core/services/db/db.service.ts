import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private _storage: Storage;

  constructor(private storage: Storage) {
  }

  //Initialize DB
  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  //Add item in DB
  async setItem(key,value) {
    return await this._storage.set(key, value);
  }

  //Read item from DB 
  async getItem(key) {
    return await this._storage.get(key);
  }

  //Clear the DB 
  async clear() {
    return await this._storage.clear();
  }
}
