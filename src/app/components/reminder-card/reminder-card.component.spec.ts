import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReminderCardComponent } from './reminder-card.component';

describe('ReminderCardComponent', () => {
  let component: ReminderCardComponent;
  let fixture: ComponentFixture<ReminderCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReminderCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReminderCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
