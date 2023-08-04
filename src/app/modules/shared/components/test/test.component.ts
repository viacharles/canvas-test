import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {

  @Input() text?: string;

  private a = 0;

  public click2() {
    this.a = this.a + 1
  }

}
