import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  constructor() { }

  /** router-outlet scroll to Top */
  public scrollToTopSubject = new Subject<void>();
  public scrollToTop$ = this.scrollToTopSubject.asObservable();

  /** 視窗 click 偵測 */
  public clickSubject = new Subject<Event>();
  public click$ = this.clickSubject.asObservable();

  /** 建立尺寸偵測 */
  public generateResizeObserver = (callback: (entry: ResizeObserverEntry) => void): ResizeObserver => {
    return new ResizeObserver(
      (entries: ResizeObserverEntry[]) => entries.forEach(entry => callback(entry)))
  }

  public tabCloseSubject = new Subject<BeforeUnloadEvent>();
  public tabClose$ = this.tabCloseSubject.asObservable();
}
