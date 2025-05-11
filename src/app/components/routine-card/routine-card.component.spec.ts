import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoutineCardComponent } from './routine-card.component';

describe('RoutineCardComponent', () => {
  let component: RoutineCardComponent;
  let fixture: ComponentFixture<RoutineCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RoutineCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
