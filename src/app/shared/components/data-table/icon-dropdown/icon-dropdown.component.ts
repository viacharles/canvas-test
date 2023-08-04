import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-icon-dropdown',
  templateUrl: './icon-dropdown.component.html',
  styleUrls: ['./icon-dropdown.component.scss']
})
export class TableIconDropdownComponent {
  @Input() iconCode = 'chevron-down';
  @ViewChild('tDropdown') tDropdown?: ElementRef;
  @ViewChild('tButton', {static: true}) tButton!: ElementRef;

  constructor() {}

  public isOpen = false;

  @HostListener('click', ['$event']) click(event: Event): void {
    if (!(this.tDropdown && this.tDropdown.nativeElement.contains(event.target)) && !this.tButton.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  public toggle(event: Event): void {
    if (!(this.tDropdown && this.tDropdown.nativeElement.contains(event.target))) {
      this.isOpen = !this.isOpen;
    }
  }
}
