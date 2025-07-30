// classes.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassesComponent } from './classes.component'; // Cambiado de 'Classes' a 'ClassesComponent'

describe('ClassesComponent', () => { // Cambiado para coincidir con el nombre del componente
  let component: ClassesComponent; // Usa 'ClassesComponent' en lugar de 'Classes'
  let fixture: ComponentFixture<ClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassesComponent] // Corregido: 'declarations' en lugar de 'imports'
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});