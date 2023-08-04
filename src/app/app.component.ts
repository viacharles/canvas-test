import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { forkJoin } from 'rxjs';
import { IField, IProject, IQuartileCheckList, IQuestion, ISystem6Rs } from './shared/interface/datatable.interface';
import { ISixRName, sixRColorMap } from './shared/map/datatable.map';
import { ITableConfig, ITableData } from './shared/components/data-table/data-table.component';
import { EQuestionSectionId } from './shared/enum/datatable.enum';
import { Quartile } from './shared/model/quartile.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('tCanvas', { static: true }) tCanvas?: ElementRef<HTMLCanvasElement>
  title = 'canvas-test';

  private ctx?: CanvasRenderingContext2D;
  constructor(
    private http: HttpClient,
    private $ws: WebsocketService,
    private $translate: TranslateService,
  ) { }

  public projectList: any[] = [];
  public tableConfigs?: ITableConfig;
  public quartile?: Quartile;

  ngOnInit(): void {
    const list = require('../assets/mockData/project-list.json');
    const quartile = require('../assets/mockData/quartile.json');
    const questions = require('../assets/mockData/questions.json');
    console.log(list, quartile, questions);
  }
}
