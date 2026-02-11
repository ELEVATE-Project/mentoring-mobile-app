import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PersonaSelectionCardComponent } from './persona-selection-card.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PersonaSelectionCardComponent', () => {
  let component: PersonaSelectionCardComponent;
  let fixture: ComponentFixture<PersonaSelectionCardComponent>;

  // Mock Data
  const mockPersonaList = [
    { name: 'Student', id: 1 },
    { name: 'Mentor', id: 2 },
    { name: 'Teacher', id: 3 }
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonaSelectionCardComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // To ignore ionic/custom elements in template
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonaSelectionCardComponent);
    component = fixture.componentInstance;
    
    // Initialize Input required for ngOnInit
    component.personaList = mockPersonaList;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should calculate personaListCount as length - 1', () => {
      // Logic from component: this.personaListCount = this.personaList.length - 1;
      expect(component.personaListCount).toBe(2); 
    });
  });

  describe('onSelect', () => {
    it('should set userType and emit the selected persona', async () => {
      // Arrange
      spyOn(component.onClickEvent, 'emit');
      const selectedPersona = { name: 'Student', id: 1 };

      // Act
      await component.onSelect(selectedPersona);

      // Assert
      expect(component.userType).toBe('Student');
      expect(component.onClickEvent.emit).toHaveBeenCalledWith(selectedPersona);
    });
  });
});