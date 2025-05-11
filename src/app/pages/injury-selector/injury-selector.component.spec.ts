import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InjurySelectorComponent } from './injury-selector.component';

describe('InjurySelectorComponent', () => {
  let component: InjurySelectorComponent;
  let fixture: ComponentFixture<InjurySelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InjurySelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InjurySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
