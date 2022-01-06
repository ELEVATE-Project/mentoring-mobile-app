import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
    private _storage: Storage | null = null;

    constructor(private storage: Storage) {
      this.init();
    }

    async init() {
        const storage = await this.storage.create();
        this._storage = storage;
      }
    
  setLocalData(key, value): Promise<any> {
    return new Promise((resolve, reject) => {
          this._storage?.set(key, value).then((success) => {
            resolve(success);
          });
    });
  }

  getLocalData(key): Promise<any> {
    return new Promise((resolve, reject) => {
      this._storage?.get(key)
        .then((data) => {
          if (data) {
            resolve(data);
          } else {
            resolve(null);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._storage
        .clear()
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject();
        });
    });
  }

  delete(key): Promise<any> {
    return new Promise((resolve, reject) => {
          this._storage.remove(key).then((data) => {
            resolve(data);
          });
    });
  }
}
