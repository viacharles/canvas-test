import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableIconDropdownComponent } from './icon-dropdown.component';

describe('TableIconDropdownComponent', () => {
  let component: TableIconDropdownComponent;
  let fixture: ComponentFixture<TableIconDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableIconDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableIconDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
