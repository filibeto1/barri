import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserClassesComponent } from './user-classes.component'; // Nombre correcto

describe('UserClassesComponent', () => { // Nombre correcto
  let component: UserClassesComponent;
  let fixture: ComponentFixture<UserClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserClassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});