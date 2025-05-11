import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InjuryCardComponent } from './injury-card.component';

describe('InjuryCardComponent', () => {
  let component: InjuryCardComponent;
  let fixture: ComponentFixture<InjuryCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InjuryCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InjuryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
