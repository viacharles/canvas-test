import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  private ws = new Map<string, WebSocket>();

  private createSocket(url: string): void {
    if (!this.ws.has(url)) {
      this.ws.set(url, new WebSocket(url))
    }
  }

  public connect(url: string) {
    this.createSocket(url);
    const ws = this.ws.get(url) as WebSocket;
    return new Observable(observable => {
      ws.onmessage = message => observable.next(message);
      ws.onerror = error => observable.error(error);
      ws.onclose = () => observable.complete();
    })
  }
}
