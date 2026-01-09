import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MentorCardComponent } from './mentor-card.component';
import { TranslateModule } from '@ngx-translate/core';

describe('MentorCardComponent', () => {
  let component: MentorCardComponent;
  let fixture: ComponentFixture<MentorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
       imports: [TranslateModule.forRoot()],
      declarations: [MentorCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MentorCardComponent);
    component = fixture.componentInstance;
    
    // Set up mock @Input data
    component.data = { 
      id: 1, 
      name: 'Dr. Jane Doe', 
      title: 'Senior Developer', 
      rating: 4.8 
    };

    fixture.detectChanges(); // Initialize the component
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the data Input property defined', () => {
    expect(component.data).toBeDefined();
    expect(component.data.name).toBe('Dr. Jane Doe');
  });

  it('should have the onClickEvent Output property defined', () => {
    expect(component.onClickEvent).toBeDefined();
  });

  // --- onCardClick Method Tests ---

  it('should emit the onClickEvent when onCardClick is called', () => {
    // Spy on the EventEmitter's emit method
    spyOn(component.onClickEvent, 'emit');

    // Define the expected payload structure
    const expectedPayload = {
      data: component.data,
      type: 'cardSelect',
    };

    // Call the method, passing the input data (which is what the template would pass)
    component.onCardClick(component.data);

    // Verify that the emit method was called once
    expect(component.onClickEvent.emit).toHaveBeenCalledTimes(1);

    // Verify that the emit method was called with the correctly structured payload
    expect(component.onClickEvent.emit).toHaveBeenCalledWith(expectedPayload);
  });
  
  it('should pass the correct data object within the emitted payload', () => {
    // Arrange: Subscribe to the output event
    let emittedValue: any;
    component.onClickEvent.subscribe(value => emittedValue = value);

    // Act: Call the click handler
    component.onCardClick(component.data);

    // Assert: Check the structure and content of the emitted value
    expect(emittedValue).toBeDefined();
    expect(emittedValue.type).toBe('cardSelect');
    expect(emittedValue.data.id).toBe(1);
    expect(emittedValue.data.name).toBe('Dr. Jane Doe');
  });
});
