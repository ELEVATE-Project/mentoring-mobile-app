import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MenteeListPopupComponent } from './mentee-list-popup.component';
import { ModalController } from '@ionic/angular';
import { AdminWorkapceService } from 'src/app/core/services/admin-workspace/admin-workapce.service';
import { SessionService } from 'src/app/core/services/session/session.service';

// Mock Data
const mockMenteeList = [
  { 
    name: 'Alice Smith', 
    designation: ['Developer'], 
    email: 'alice@example.com', 
    type: 'Self-Enrolled',
    organization: { name: 'TechCorp' } // Nested organization data
  },
  { 
    name: 'Bob Johnson', 
    designation: ['Manager'], 
    email: 'bob@example.com', 
    type: 'Admin-Enrolled',
    organization: { name: 'Innovate Solutions' } 
  },
];

// Mock Service Implementations
const mockSessionService = {
  getEnrolledMenteeList: jasmine.createSpy('getEnrolledMenteeList').and.returnValue(Promise.resolve(mockMenteeList)),
};

const mockAdminWorkapceService = {
  downloadMenteeList: jasmine.createSpy('downloadMenteeList'),
};

const mockModalController = {
  dismiss: jasmine.createSpy('dismiss'),
};

describe('MenteeListPopupComponent', () => {
  let component: MenteeListPopupComponent;
  let fixture: ComponentFixture<MenteeListPopupComponent>;
  let sessionService: SessionService;
  let adminWorkapceService: AdminWorkapceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenteeListPopupComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: AdminWorkapceService, useValue: mockAdminWorkapceService },
        { provide: ModalController, useValue: mockModalController },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenteeListPopupComponent);
    component = fixture.componentInstance;
    
    // Inject services for testing
    sessionService = TestBed.inject(SessionService);
    adminWorkapceService = TestBed.inject(AdminWorkapceService);
    
    // Set a dummy Input ID
    component.id = 123;
    
    // Reset spies before each test
    mockSessionService.getEnrolledMenteeList.calls.reset();
    mockAdminWorkapceService.downloadMenteeList.calls.reset();
    mockModalController.dismiss.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- ngOnInit & Lifecycle Hook Tests ---

  it('should set isMobile to true when window width is 800 or less on initialization', () => {
    // Mock innerWidth to simulate mobile device
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
    component.ngOnInit();
    expect(component.isMobile).toBeTrue();
  });

  it('should set isMobile to false when window width is greater than 800 on initialization', () => {
    // Mock innerWidth to simulate desktop device
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1024);
    component.ngOnInit();
    expect(component.isMobile).toBeFalse();
  });

  it('should call fetchMenteeList on ngOnInit', () => {
    spyOn(component, 'fetchMenteeList').and.stub();
    component.ngOnInit();
    expect(component.fetchMenteeList).toHaveBeenCalled();
  });

  it('should call fetchMenteeList on ionViewWillEnter', async () => {
    spyOn(component, 'fetchMenteeList').and.stub();
    await component.ionViewWillEnter();
    expect(component.fetchMenteeList).toHaveBeenCalled();
  });

  // --- fetchMenteeList Data Logic Tests ---

  it('should fetch the mentee list and transform the organization field', fakeAsync(() => {
    // Call ngOnInit to trigger the fetch
    component.ngOnInit();
    tick(); // Wait for the promise in fetchMenteeList to resolve

    // 1. Verify service call
    expect(sessionService.getEnrolledMenteeList).toHaveBeenCalledWith(component.id);

    // 2. Verify data transformation
    // The component should have flattened the nested 'organization.name'
    expect(component.enrolledMenteeList.length).toBe(2);
    expect(component.enrolledMenteeList[0].organization).toBe('TechCorp');
    expect(component.enrolledMenteeList[1].organization).toBe('Innovate Solutions');
  }));

  it('should handle null data returned from getEnrolledMenteeList gracefully', fakeAsync(() => {
    // Set the spy to return null
    mockSessionService.getEnrolledMenteeList.and.returnValue(Promise.resolve(null));
    
    component.ngOnInit();
    tick(); // Wait for the promise

    // Verify list is null/undefined (depending on how the test initializes it)
    expect(component.enrolledMenteeList).toBeNull();
    
    // Restore spy for other tests
    mockSessionService.getEnrolledMenteeList.and.returnValue(Promise.resolve(mockMenteeList));
  }));

  // --- Action Button Tests ---

  it('should call downloadMenteeList on AdminWorkapceService when onClickDownload is called', () => {
    component.onClickDownload();
    expect(adminWorkapceService.downloadMenteeList).toHaveBeenCalledWith(component.id);
  });

  it('should dismiss the modal when closePopup is called', () => {
    component.closePopup();
    expect(mockModalController.dismiss).toHaveBeenCalled();
  });
});