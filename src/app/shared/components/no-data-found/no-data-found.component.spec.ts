import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from './no-data-found.component';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import { TranslateModule } from '@ngx-translate/core';

// Mock Dependencies
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

const mockProfileService = {
  // Define isMentor property, which is accessed directly in the constructor
  isMentor: false, 
};

describe('NoDataFoundComponent', () => {
  let component: NoDataFoundComponent;
  let fixture: ComponentFixture<NoDataFoundComponent>;
  let profileService: ProfileService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [NoDataFoundComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ProfileService, useValue: mockProfileService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoDataFoundComponent);
    component = fixture.componentInstance;
    profileService = TestBed.inject(ProfileService);

    // Reset spies before each test
    mockRouter.navigate.calls.reset();
    
    // Default setup for isMentor to ensure constructor logic is tested
    mockProfileService.isMentor = false; 

    fixture.detectChanges(); // Calls constructor and ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Constructor and Property Initialization Tests ---

  it('should initialize isMentor as false if profileService.isMentor is false', () => {
    // Already set up in beforeEach
    expect(component.isMentor).toBeFalse();
  });

  it('should initialize isMentor as true if profileService.isMentor is true', () => {
    // Need to override the mock and recreate the component to re-run the constructor
    mockProfileService.isMentor = true; 
    const fixtureTrue = TestBed.createComponent(NoDataFoundComponent);
    const componentTrue = fixtureTrue.componentInstance;
    fixtureTrue.detectChanges(); 
    
    expect(componentTrue.isMentor).toBeTrue();
  });

  it('should initialize the default image path', () => {
    expect(component.image).toBe('assets/no-data/no_result_found.png');
  });

  // --- Input Binding Tests ---

  it('should correctly bind the messageHeader input', () => {
    const testHeader = 'No Items Found';
    component.messageHeader = testHeader;
    fixture.detectChanges();
    expect(component.messageHeader).toBe(testHeader);
  });

  it('should correctly bind the messageDescription input', () => {
    const testDescription = 'Try adjusting your filters.';
    component.messageDescription = testDescription;
    fixture.detectChanges();
    expect(component.messageDescription).toBe(testDescription);
  });
  
  it('should correctly bind the exploreButton input', () => {
    component.exploreButton = true;
    fixture.detectChanges();
    expect(component.exploreButton).toBeTrue();
  });

  it('should allow overriding the default image path', () => {
    const customImage = 'assets/custom/no_favorites.svg';
    component.image = customImage;
    fixture.detectChanges();
    expect(component.image).toBe(customImage);
  });

  // --- onSubmit Method (Routing) Tests ---

  it('should navigate to the mentor directory route when onSubmit is called', () => {
    component.onSubmit();
    
    // Check if the router.navigate was called with the correct path and options
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [`/${CommonRoutes.TABS}/${CommonRoutes.MENTOR_DIRECTORY}`],
      { replaceUrl: true }
    );
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });
});