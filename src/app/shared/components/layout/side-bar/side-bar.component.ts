import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, takeUntil, timer } from 'rxjs';
import { UnSubOnDestroy } from 'src/app/shared/base/unSubOnDestory.abstract';
import { ELogin, EMenuItemFunctionMark, EModule } from 'src/app/shared/enum/router.enum';
import { IMenuParams } from 'src/app/shared/interface/router.interface';
import { MenuMap } from 'src/app/shared/map/router.map';
import { LayoutService } from 'src/app/shared/seervice/layout.service';
import { WindowService } from 'src/app/shared/seervice/window.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent extends UnSubOnDestroy implements OnInit {
  @Output() resize = new EventEmitter<number>();

  /** menu data map */
  public mainMenu = MenuMap;
  public menuForm = new FormControl(this.router.url);
  public activeRoute = '';
  timeStamp = (new Date()).getTime();
  profilePicSrc = 'assets/img/profile-pic1.png';
  userName: string = '';
  tenantName: string = '';
  menuIndex: string = '';
  userData: any;
  userId: any;
  tenantData: any;
  tempFilename = '';
  public isMenuExpand = true;
  private resizeObserver?: ResizeObserver;

  constructor(
    public router: Router,
    private $window: WindowService,
    private $layout: LayoutService,
    private self: ElementRef,
  ) {
    super();
    this.activeRoute = router.routerState.snapshot.url;
    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        map((event: any) => event as NavigationEnd),
      )
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.url;
      });
  }

  ngOnInit(): void {
    console.log('aa-map', this.mainMenu)
    this.$layout.doSidebarExpand$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(is => timer(0).subscribe(() => this.isMenuExpand = is));
    this.afterPageChanged();
    this.router.events
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(_ => {
        this.afterPageChanged();
      })
  }

  ngAfterViewInit(): void {
    this.resizeObserver = this.$window.generateResizeObserver(
      (entry) => {
        this.resize.emit(entry.contentRect.width);
      }
    );
    this.resizeObserver.observe(this.self.nativeElement);
  }

  protected override onDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /** menu項目自訂功能 */
  public customFunction(mark?: EMenuItemFunctionMark): void {
    switch(mark) {
      case EMenuItemFunctionMark.Login:
      // this.authService.doLogout();
      break;
    }
  }


  /** 母項目擁有子項目或本身有導頁功能的才顯示 */
  public showParentItem(parentItem: IMenuParams): boolean {
    return !!parentItem.path || !!parentItem.subMenu;
  }

  /** 點擊 menu 項目
   * @param mainKey 主項目key
   * @param subKey 子項目key
  */
  public toggleMenu(mainKey: string, subKey?: string, mark?: EMenuItemFunctionMark): void {
    const Target =
    subKey !== undefined
          ? this.mainMenu.get(mainKey as EModule)?.subMenu?.get(subKey)
          : this.mainMenu.get(mainKey as EModule);
    if (Target?.isExpand !== undefined) {
      Target!.isExpand = !Target!.isExpand;
    }
    if (Target?.path) {
      this.router.navigateByUrl(Target?.path);
    }
    if (mark) {
    this.customFunction(mark);
    }
  }

  /** 為了讓MenuMap以本來的方式排序 */
  public asIsOrder(a: any, b: any) { return 0 }

  /** 頁面切換後 */
  private afterPageChanged(): void {
    this.mainMenu.forEach((value, key) => value.isExpand = this.router.url.split('/')[1] === key);
    this.menuForm.setValue(this.router.url);
  }
}
