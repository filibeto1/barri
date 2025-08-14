import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { CrearInstructorComponent } from './crear-instructor.component';
import { InstructorService } from '../../services/instructor.service';

describe('CrearInstructorComponent', () => {
  let component: CrearInstructorComponent;
  let fixture: ComponentFixture<CrearInstructorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearInstructorComponent],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: InstructorService, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearInstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});