import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndScreen } from './end-screen';

describe('EndScreen', () => {
  let component: EndScreen;
  let fixture: ComponentFixture<EndScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
