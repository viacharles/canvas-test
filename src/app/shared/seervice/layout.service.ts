import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor() { }

  /** 控制 sidebar 開闔 */
  public doSidebarExpandSubject = new Subject<boolean>();
  public doSidebarExpand$ = this.doSidebarExpandSubject.asObservable();
}
