import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const list = require('../../../assets/mockData/project-list.json');
    const quartile = require('../../../assets/mockData/quartile.json');
    const questions = require('../../../assets/mockData/questions.json');
    console.log(list, quartile, questions);
  }
}
