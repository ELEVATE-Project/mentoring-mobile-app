import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HTTP) {}

  get = (url) => this.http.get(url, {}, this.header());

  post = (url, body) => this.http.post(url, body, this.header());

  delete = (url) => this.http.delete(url, {}, this.header());

  header = () => {
    const header = {
      authorization: '2143324324',
      deviceId: '123',
    };
    return header;
  };
}
