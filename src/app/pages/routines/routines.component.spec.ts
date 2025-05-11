import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoutinesComponent } from './routines.component';

describe('RoutinesComponent', () => {
  let component: RoutinesComponent;
  let fixture: ComponentFixture<RoutinesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RoutinesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
