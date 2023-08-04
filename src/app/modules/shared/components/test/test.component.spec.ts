import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TestComponent } from './test.component';



describe('TestComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show test button', () => {
    component.text = 'test button';
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('button').textContent).toBe('test button');
  });

  it('should toggle click event', fakeAsync(() => {
    const originA = component['a'];
    fixture.debugElement.nativeElement.querySelector('[data-testid = "123"]').click();
    fixture.detectChanges();
    tick();
    expect(component['a']).toEqual(originA + 1);
  }))
});
