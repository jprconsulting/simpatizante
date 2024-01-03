import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatosComponent } from './candidatos.component';

describe('CandidatosComponent', () => {
  let component: CandidatosComponent;
  let fixture: ComponentFixture<CandidatosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CandidatosComponent]
    });
    fixture = TestBed.createComponent(CandidatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
