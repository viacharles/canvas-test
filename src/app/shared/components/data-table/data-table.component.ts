import { Component, Input, OnChanges, Output, EventEmitter, OnInit, ElementRef, OnDestroy, QueryList, ViewChildren, ViewChild, AfterViewInit, HostListener, Renderer2, Sanitizer } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('tScrollContainer', { static: true }) tScrollContainer?: ElementRef<HTMLElement>;
  @ViewChild('tTrack', { static: true }) tTrack?: ElementRef<HTMLElement>;
  @ViewChild('tThumb', { static: true }) tThumb?: ElementRef<HTMLElement>;
  @ViewChild('tContainer', { static: true }) tContainer?: ElementRef<HTMLElement>;
  @ViewChildren('tFilterCheckboxes') tFilterCheckboxes?: QueryList<ElementRef>;
  @ViewChildren('tSortButtons') tSortButtons?: QueryList<ElementRef>;
  @ViewChild('tSelectAll') tSelectAll?: ElementRef<HTMLInputElement>;
  @Output() rowClick = new EventEmitter<string | number>();
  @Output() viewReady = new EventEmitter<void>();
  /** 所有被選取的 row 的 key */
  @Output() rowsSelect = new EventEmitter<(string | number)[]>();
  @Input() search$: Observable<string> = new Observable;
  @Input() resetTable$: Observable<void> = new Observable;
  @Input() data: ITableData[] = [];
  @Input() config?: ITableConfig;

  /** 畫面顯示的 rows */
  get getDisplayRows(): ITableRow[] {
    const displayRows = this.rowsChunk.slice(0, this.currentChunk);
    return displayRows.reduce((total, chunk) => ([...total, ...chunk]), []);
  }
  constructor(private self: ElementRef, private sanitizer: DomSanitizer) { }

  private rows: ITableRow[] = [];
  public rowsBeforeChunk: ITableRow[] = [];
  /** 已分區塊的rows */
  public rowsChunk: ITableRow[][] = [];
  /** 標頭欄位相關設定 */
  public headColumns: IColumnConfigView[] = [];
  /** 目前Loading區塊 */
  private currentChunk = 1;
  /** 搜尋文字 */
  public searchText = '';
  /** 選取的過濾項目集合 */
  public filterCollection: { [key: string]: string[] } = {};
  /** 被選取的 row 的 key 集合 */
  public rowCollection: (string | number)[] = []
  public isAllRowsSelect = false;
  public sortConfig?: { sortCode: string, columnCode: string };
  public contentWidth = 0; // 内容區域的寬度
  public trackWidth = 0; // scroll軌道的寬度
  public thumbWidth = 0; // scroll bar的寬度
  public thumbTransform = `translateX(0px)`; // scroll bar的 transform 屬性值
  /** rows 更新事件 */
  public rowsResetSubject = new BehaviorSubject<{ data: ITableData[], config: ITableConfig, searchText: string, filters: { [key: string]: string[] } }>({ data: [], config: { rowKeyName: '', columnConfigs: [] }, searchText: '', filters: {} });
  private rowsReset$ = this.rowsResetSubject.asObservable();
  private subscription = new Subscription();
  /** 畫面使用的文字 */
  public text = {
    sort: '排序條件',
    filter: '篩選條件',
    all: '全選',
    clear: '清除',
    null: '無資料',
    showCount: '顯示數量',
    noRowsWarn: '目前尚無資料',
  };
  /** 翻譯庫 */
  public i18nLib = {
    en: {
      sort: "Sort",
      filter: "Filter",
      all: "SelectAll",
      clear: "Clear",
      null: 'No data',
      showCount: 'display count',
      noRowsWarn: 'Currently no data available',
    },
    zh: {
      sort: "排序條件",
      filter: "篩選條件",
      all: "全選",
      clear: "清除",
      null: '無資料',
      showCount: '顯示數量',
      noRowsWarn: '目前尚無資料',
    }
  }

  ngOnInit(): void {
    const RowsReset =
      this.rowsReset$
        .subscribe(({ config }) => {
          this.rowsChunk =
            this.chunkRows(
              this.getRowsSorted(
                this.getRowFiltered(
                  this.getRowSearched(this.rows, this.searchText, config), this.filterCollection
                ), this.sortConfig
              )
            );
        });
    const Search =
      this.search$
        .subscribe(text => {
          this.searchText = text;
          this.isAllRowsSelect = false;
          if (this.tSelectAll) {
            this.tSelectAll.nativeElement.checked = false;
          }
          if (this.data && this.config) {
            this.initFilterCollection(this.data, this.config, this.filterCollection); // 搜尋時過濾需重置
            this.resetSortAndFilter(this.tFilterCheckboxes);
            this.rowsResetSubject.next({ data: this.data, config: this.config, searchText: this.searchText, filters: this.filterCollection });
          }
        });
    const TableReset =
      this.resetTable$
        .subscribe(() => {
          this.searchText = '';
          this.isAllRowsSelect = false;
          if (this.tSelectAll) {
            this.tSelectAll.nativeElement.checked = false;
          }
          if (this.data && this.config) {
            this.initFilterCollection(this.data, this.config, this.filterCollection);
            this.resetSortAndFilter(this.tFilterCheckboxes, this.tSortButtons);
            this.rowsResetSubject.next({ data: this.data, config: this.config, searchText: this.searchText, filters: this.filterCollection });
          }
        })
    this.subscription.add(TableReset);
    this.subscription.add(RowsReset);
    this.subscription.add(Search);
  }

  ngAfterViewInit(): void {
    this.initScrollBar();
    this.viewReady.emit();
  }

  ngOnChanges(): void {
    if (this.data && this.config) {
      this.initByConfig(this.config)
      if (this.config.i18n) {
        this.translateText(this.text, this.config.i18n, this.i18nLib)
      }
      this.rows = this.getRows(this.data, this.config); // rows 只有 Input 資料有更新時才重新計算
      this.headColumns = this.getHeadColumns(this.data, this.config);
      this.initFilterCollection(this.data, this.config!, this.filterCollection);
      this.rowsResetSubject.next({ data: this.data, config: this.config, searchText: this.searchText, filters: this.filterCollection });
    };
  }

  @HostListener('window:resize', ['$event']) onWindowResize(event: Event) {
    this.initScrollBar();
  }

  private initScrollBar(): void {
    this.contentWidth = this.tContainer!.nativeElement.scrollWidth;
    this.trackWidth = this.tContainer!.nativeElement.clientWidth - 30 ?? 0;
    this.tTrack!.nativeElement.style.width = `${this.trackWidth}px`;
    this.thumbWidth = Math.max(this.trackWidth * (this.trackWidth / this.contentWidth), 20);
    this.tThumb!.nativeElement.style.width = `${this.thumbWidth}px`;
  }

  /** custom scroll */
  public startScroll(event: MouseEvent): void {
    event.preventDefault();
    const Thumb = this.tThumb!.nativeElement;
    const Track = this.tTrack!.nativeElement;
    const Content = this.tContainer!.nativeElement;
    const StartX = event.clientX - Thumb.getBoundingClientRect().left;
    const mousemoveListener = (event: MouseEvent) => {
      const scrollLeft = (event.clientX - Track.getBoundingClientRect().left - StartX) * (this.contentWidth / Track.clientWidth);
      Content.scrollLeft = scrollLeft;
      const TranslateX = scrollLeft * (Track.clientWidth / this.contentWidth)
      this.thumbTransform = `translateX(${TranslateX < 0 ? 0 : TranslateX > this.trackWidth - this.thumbWidth ? this.trackWidth - this.thumbWidth : TranslateX}px)`;
    }
    const mouseupListener = () => {
      document.removeEventListener('mousemove', mousemoveListener);
      document.removeEventListener('mouseup', mouseupListener);
    }
    document.addEventListener('mousemove', mousemoveListener);
    document.addEventListener('mouseup', mouseupListener);
  }

  /** 顯示sort icon */
  public showSortIcon(column: IColumnConfigView): boolean {
    return !!this.sortConfig && this.sortConfig.columnCode === column.code;
  }

  /** 此欄是否有過濾選項啟用 */
  public hasOptionsModified(column: IColumnConfigView): boolean {
    return column.hasFilter ? !!column.filterOptions?.find(option => !this.filterCollection[column.code].includes(option)) : false;
  }

  /** 該欄過濾選項 全選/全不選
   * @param isCheck true 為全選; false 為全不選
   * @param column 該欄
   * @param filterNode 該欄 filter 畫面物件 */
  public checkAll(isCheck: boolean, column: IColumnConfigView, filterNode: HTMLElement): void {
    this.filterCollection[column.code] = isCheck ? column.filterOptions! : [];
    this.rowsResetSubject.next({ data: this.data, config: this.config!, searchText: this.searchText, filters: this.filterCollection });
    (filterNode.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>).forEach(checkbox => checkbox.checked = isCheck)
  }

  /** rows 全選/全不選
   * @param rows 過濾/搜尋後的 rows
   * @param keyCollection 選取的 row 的 key 的容器 */
  public selectAllRows(event: Event, TableNode: HTMLElement, rows: ITableRow[]): void {
    const Checkboxes = TableNode.querySelector('tbody')?.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    const isCheck = (event.target as HTMLInputElement).checked;
    this.isAllRowsSelect = isCheck;
    Checkboxes?.forEach(checkbox => checkbox.checked = isCheck);
    this.rowCollection = isCheck ? rows.map(row => row.key) : [];
    this.rowsSelect.emit(this.rowCollection);
  }

  /** rows 單選/單不選
  * @param keySelected 選取的 row 的 key
  * @param keyCollection 選取的 row 的 key 的容器 */
  public selectRow(event: Event, keySelected: string | number): void {
    if ((event.target as HTMLInputElement).checked) {
      this.rowCollection.push(keySelected)
    } else {
      this.rowCollection = this.rowCollection.filter(key => keySelected !== key);
    }
    this.rowsSelect.emit(this.rowCollection);
  }

  /** 由點擊事件蒐集過濾選項
   * @param event 點擊事件
   * @param targetName 該選項名稱
   * @param code 該欄位code
   * @param collection 蒐集的容器 */
  public collectFilterOption(event: Event, targetName: string, code: string, collection: { [key: string]: (string | null)[] }): void {
    if ((event.target as HTMLInputElement)?.checked) {
      if (collection[code]) {
        collection[code].push(targetName);
      } else {
        collection[code] = [];
        collection[code].push(targetName);
      }
    } else {
      collection[code] = collection[code].filter(option => option !== targetName);
    }
    this.rowsResetSubject.next({ data: this.data, config: this.config!, searchText: this.searchText, filters: this.filterCollection });
  }

  public scroll(event: WheelEvent): void {
    // table與scroll bar連動
    const Content = this.tContainer!.nativeElement;
    const Track = this.tTrack!.nativeElement;
    this.thumbTransform = `translateX(${Content.scrollLeft / (this.contentWidth / Track.clientWidth)}px)`;
    const Target = event.target as HTMLElement;
    // 畫面 loading 下一區塊
    if ((Target.scrollHeight - Target.scrollTop - Target.clientHeight) <= 700
      && this.currentChunk < this.rowsChunk.length) {
      this.currentChunk = this.currentChunk + 1;
    }

  }

  /** 排序
   * @param columnCode 欄code
   * @param sortCode 'asc':升冪 'desc':降冪 */
  public sort(columnCode: string, sortCode: string): void {
    this.sortConfig = { columnCode, sortCode };
    this.rowsResetSubject.next({ data: this.data, config: this.config!, searchText: this.searchText, filters: this.filterCollection });
  }

  /** 將 row 以數個基數為一組
   * @param per 基數 */
  private chunkRows(rows: ITableRow[], per = 30): ITableRow[][] {
    this.rowsBeforeChunk = rows;
    const Chunk = [];
    for (let i = 0; i <= rows.length; i = i + per) {
      Chunk.push(rows.slice(i, i + per));
    };
    return Chunk;
  }

  /** 獲得所有 row */
  private getRows(data: ITableData[], config: ITableConfig): ITableRow[] {
    return data.map(valueObject => ({
      key: valueObject[config!.rowKeyName] as string | number,
      columns: config.columnConfigs
        .map(columnConfig => {
          return ({
            ...{
              value: valueObject[columnConfig.code],
              valueDes: columnConfig.desCode ? valueObject[columnConfig.desCode] : undefined
            },
            ...columnConfig
          })
        }
        )
    }));
  }

  /** 獲得排序後的 rows
   * @param sort 排序設定 */
  private getRowsSorted(rows: ITableRow[], sort?: { columnCode: string, sortCode: string }): ITableRow[] {
    return sort ? rows.sort((a, b) => {
      const Current = a.columns.find(column => column.code === sort.columnCode) as ITableColumn;
      const Next = b.columns.find(column => column.code === sort.columnCode) as ITableColumn;
      return ((Current.value || 0) > (Next.value || 0))
        ? (sort.sortCode === 'asc' ? 1 : -1)
        : ((Current.value || 0) < (Next.value || 0))
          ? (sort.sortCode === 'asc' ? -1 : 1)
          : 0
    }) : rows;
  }

  /** 獲得搜尋後的 rows
   * @ 如果沒有任何欄位設定 inSearch，讓第一個欄位成為 search 對象
   * @param searchText 搜尋的文字
   * @param config 總控制設定 */
  private getRowSearched(rows: ITableRow[], searchText: string, config: ITableConfig): ITableRow[] {
    const SearchList = config!.columnConfigs.filter(columnConfig => columnConfig.inSearch);
    return rows.filter(row => {
      const SearchListWithoutEmpty =
        SearchList.length > 0
          ? SearchList.map((columnInSearch: IColumnConfig) => row.columns.find(column => column.code === columnInSearch.code)?.value || '')
          : [row.columns[0].value];
      return SearchListWithoutEmpty.some(column => `${column}`.includes(searchText))
    });
  }

  /** 獲得過濾後的 rows
   * @param searchText 搜尋的文字
   * @param filters 已勾選的過濾項列表 */
  private getRowFiltered(rows: ITableRow[], filters: { [key: string]: string[] }): ITableRow[] {
    return rows.filter(row => {
      return Object.entries(filters).every(([key, options]) => {
        const Column = row.columns.find(column => column.code === key);
        return options.some(option => {
          return Column?.filterConfig?.isFuzzyFilter
            ? `${Column?.value ?? this.text.null}`.includes(option)
            : option === `${Column?.value || Column?.value === 0 ? Column?.value : this.text.null}`
        })
      })
    })
  }

  /** 獲得所有標頭欄資料
   * @ 計算每個 row 的該欄統整不同的值生成過濾選項
   * @ null 的選項顯示為"無資料" */
  private getHeadColumns(data: ITableData[], config: ITableConfig): IColumnConfigView[] {
    return config.columnConfigs.map(columnConfig => {
      return ({
      ...columnConfig,
      ...{
        filterOptions:
          columnConfig.hasFilter
            ? columnConfig.filterConfig?.customFilterOptions
            || data.reduce((options: string[], valueObject) => {
              const Target = `${(!!valueObject[columnConfig.code]) ? valueObject[columnConfig.code] : this.text.null}`;
              if (!options.some(option => option === Target)) {
                options.push(Target);
              }
              return options;
            }, []).sort() : []
      }
    })});
  }

  /** 初始化過濾選項容器
   * @ 只建立 hasMultiFilterOption === true 的欄位
   * @param data 所有 row 資料
   * @param config table 總設定
   * @param collection 過濾選項容器 */
  private initFilterCollection(data: ITableData[], config: ITableConfig, collection: { [key: string]: (string | null)[] }): void {
    config.columnConfigs.forEach(columnConfig => {
      if (columnConfig.hasFilter) {
        collection[columnConfig.code] =
          columnConfig.hasFilter
            ? columnConfig.filterConfig?.customFilterOptions
            || data.reduce((options: string[], valueObject) => {
              const Target = `${(!!valueObject[columnConfig.code]) ? valueObject[columnConfig.code] : this.text.null}`;
              if (!options.some(option => option === Target)) {
                options.push(Target);
              }
              return options;
            }, [])
            : []
      }
    });
  }

  /** 依照語言置換畫面文字
   * @param texts 畫面使用文字
   * @param i18nCode 語言code ex. 'en' 'zh'
   * @param i18nLib 翻譯庫 */
  private translateText(texts: { [key: string]: string }, i18nCode = 'zh', i18nLib: { [key: string]: { [key: string]: string } }): void {
    Object.keys(texts)
      .forEach(key => {
        texts[key] = i18nLib[i18nCode][key];
      })
  }

  /** 依設定初始化 */
  private initByConfig(config: ITableConfig): void {
    if (config.themeColor) {
      this.self.nativeElement.style.setProperty('--theme-color', config.themeColor);
    }
    if (config.color?.generalText) {
      this.self.nativeElement.style.setProperty('--default-text', config.color?.generalText);
    }
    if (config.color?.headerText) {
      this.self.nativeElement.style.setProperty('--default-header-text', config.color?.headerText);
    }
    if (config.font?.header) {
      this.self.nativeElement.style.setProperty('--font-header', config.font?.header);
    }
    if (config.font?.column) {
      this.self.nativeElement.style.setProperty('--font-Column', config.font?.column);
    }
  }

  /** 重置排序與過濾 */
  private resetSortAndFilter(checkboxNodes?: QueryList<ElementRef>, sortButtons?: QueryList<ElementRef>): void {
    if (checkboxNodes) {
      checkboxNodes!.forEach(node => node.nativeElement.checked = true);
    };
    if (sortButtons) {
      sortButtons.forEach(node => node.nativeElement.checked = false)
    }
    this.sortConfig = undefined;
  }

  /** 消毒html */
  public getSafeHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  public getColor(
    value: string | number,
    color?: string | ((value: string | number) => string))
    : string {
      if (color && typeof color === 'function') {
        return color(value);
      } else {
        return `${color}`
      }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}


//=== ** Example * ===/

// Input() data = [
//   {
//     projectKey: 'xhgdjll46hk',
//     name: '皮ＸＸ',
//     gender: '男',
//   },
//   {
//     projectKey: 'khklj4j9pohugtds',
//     name: '還ＯＯ',
//     gender: '女',
//   },
//   {
//     projectKey: '46gkl;l4j9khgff78',
//     name: '衛ＯＯ',
//     gender: '男',
//   }
// ]
//
// Input() config = {
//   rowKeyName: 'projectKey',
//   maxHeight: '450px',
//   themeColor: 'red',
//   countLabel: '系統總數',
//   hasSort: true,
//   hasMultiFilterOption: true,
//   columnConfigs: [
//      {
//       code: 'name',
//       label: '姓名',
//       hasMultiFilterOption: true,
//      },
//      {
//       code: 'gender',
//       label: '性別',
//       hasMultiFilterOption: true,
//       fontColor: 'red',
//      },
//   ]
// }


//=== ** Interface * ===/

/** 總控制設定
 * @param rowKeyName 指定每筆資料的統一 key 名稱
 * @param {IColumnConfig[]} columnConfigs 每欄的設定
 * @param maxHeight (option) table最高高度
 * @param themeColor (option) 主題色
 * @param color (option) 自訂顏色 { headerText(option): 標頭字顏色; generalText(option): 一般字顏色}
 * @param countLabel (option) 總數文字描述
 * @param i18n (option) 目前語言
 * @param hasRowSelection (option) 是否開放 row 選擇欄位
 * @param hasSort (option) 是否開放排序功能
 * @param hasMultiFilterOption (option) 是否開放多選項過濾功能
 * @param font (option) 字型 { header(option): 標頭; column(option): 欄}
 * */
export interface ITableConfig {
  rowKeyName: string,
  columnConfigs: IColumnConfigView[],
  maxHeight?: string,
  themeColor?: string,
  fontColor?: string,
  countLabel?: string,
  i18n?: string,
  hasRowSelection?: boolean,
  hasSort?: boolean,
  hasMultiFilterOption?: boolean,
  font?: {
    header?: string,
    column?: string,
  },
  color?: {
    headerText?: string,
    generalText?: string,
  }
}

/** data物件
 * @key 該欄 key */
export interface ITableData {
  [key: string]: string | number | null,
}

/** 該欄控制設定
 * @param label 標頭欄位名稱
 * @param code 該欄對值的 key: 同 ITableData 裡屬於該欄的 key
 * @param desCode (option) 該欄第二行對值的 key: 同 ITableData 裡屬於該欄的 key
 * @param inSearch (option) 在搜尋範圍內
 * @param hasFilter (option) 有多選項過濾功能
 * @param filterConfig-customFilterOptions (option) 自訂過濾選項列表
 * @param filterConfig-isFuzzyFilter (option) 是否為模糊過濾
 * @param inform (option) 顯示(i)icon，hover時顯示一行說明
 * @param customFilterOptions (option) 自訂過濾選項列表
 * @param hasSort (option) 有排序功能
 * @param customClass (option) customize classes ex. 'title1, text-red'
 * @param style (option) customize style string ex. 'color: red; width: 300px; font-size: 20px'
 * @param colorArray (option) 字顏色列表
 * @param fixedWidth (option) 固定寬度 ex. '30px' '20%'
 * @param fontColor (option) 字顏色
 * @param fontSize (option) 字尺寸 ex. '12px' '3rem'
 * */
export interface IColumnConfig {
  label: string,
  code: string,
  desCode?: string,
  inSearch?: boolean,
  hasFilter?: boolean,
  filterConfig?: {
    customFilterOptions?: string[],
    showTransform?: (value: string | number, row: ITableRow) => string,
    isFuzzyFilter?: boolean,
  },
  tooltip?: {
    textExpression: (value: string | number, row: ITableRow, index: number, data: ITableData[]) => string,
    showExpression: (value: string | number, row: ITableRow, index: number, data: ITableData[]) => boolean,
    backgroundColor?: string,
  },
  iconTooltip?: {
    text: string,
    showExpression: (value: string | number, row: ITableRow, index: number, data: ITableData[]) => boolean,
    backgroundColor?: string,
    type?: 'info' | 'warn',
  },
  hasSort?: boolean,
  customClass?: string,
  style?: string,
  fixedWidth?: string,
  font?: {
    color?: string | ((value: string | number) => string),
    size?: string
    weight?: 200|300|400|600|700|800
  },
  fontMulti?: (value: string | number | null) => {
    value: string;
    color?: string,
    size?: string
    weight?: 200|300|400|600|700|800
  }[]
}
/** 該欄控制設定
 * @param filterOptions (option) 過濾選項列表 */
export interface IColumnConfigView extends IColumnConfig {
  filterOptions?: string[],
}

/** 該欄
 * @param value 該欄顯示內容 - 第一行
 * @param valueDes (option)該欄顯示內容 - 第二行 */
export interface ITableColumn extends IColumnConfig {
  value: number | string | null,
  valueDes?: number | string | null,
}

/** 該行  */
export interface ITableRow {
  key: string | number,
  columns: ITableColumn[],
}

/** scroll方式 */
export interface IScrollType {
  type: "overflow-x" | "overflow-y" | "overflow",
  value: "hidden" | "auto"
}
