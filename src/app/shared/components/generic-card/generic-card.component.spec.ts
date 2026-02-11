import 'zone.js';          
import 'zone.js/testing';  

/* generic-card.component.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GenericCardComponent } from './generic-card.component';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/core/services';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { CommonRoutes } from 'src/global.routes';
import { TranslateModule } from '@ngx-translate/core';

describe('GenericCardComponent', () => {
  let component: GenericCardComponent;
  let fixture: ComponentFixture<GenericCardComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocalStorage: jasmine.SpyObj<LocalStorageService>;

  beforeEach(waitForAsync(async () => {
    // use createSpyObj so we can reset / change returns easily
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);

    // default getLocalData returns 'false'
    mockLocalStorage.getLocalData.and.returnValue(Promise.resolve('false'));

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [GenericCardComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: LocalStorageService, useValue: mockLocalStorage }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    // IMPORTANT: override the real template so test won't execute binding expressions in your template
    .overrideComponent(GenericCardComponent, {
      set: {
        // minimal inert template — you can add minimal DOM if you want, but avoid any binding to `data.*`
        template: `<div></div>`
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericCardComponent);
    component = fixture.componentInstance;

    // default inputs - ensure template has everything it might read if you ever enable template
    component.buttonConfig = [];
    component.meta = {};
    component.cardConfig = {};
    component.disableButton = false;
    component.showTag = null;
    component.disableNavigation = false;

    // Provide a safe data object for any class logic in the tests
    component.data = {
      id: 123,
      user_id: null,
      image: 'https://example.com/avatar.png',
      name: 'Test Mentor',
      title: 'Senior Mentor',
      connection_meta: { room_id: 'r1' },
      role: 'mentor',
      values: []
    };

    // explicitly call ngOnInit and await any async initialisation so tests are deterministic
    await component.ngOnInit();

    // We intentionally DO NOT call fixture.detectChanges() on the real template (we replaced it).
    // If you later want to test template rendering, remove overrideComponent and provide full-safe data.
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should read chatConfig from LocalStorageService', async () => {
    // getLocalData called during beforeEach ngOnInit; assert it was called with the correct key
    expect(mockLocalStorage.getLocalData).toHaveBeenCalledWith(localKeys['CHAT_CONFIG']);
    expect(component.chatConfig).toBe('false');
  });

  it('onCardClick should navigate to mentor details when disableNavigation is false', () => {
    component.disableNavigation = false;
    const payload = { id: 555 };
    component.onCardClick(payload);
    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, payload.id]);
  });

  it('onCardClick should NOT navigate when disableNavigation is true', () => {
    // reset navigate spy call history to avoid cross-test pollution (defensive)
    mockRouter.navigate.calls.reset();

    component.disableNavigation = true;
    const payload = { id: 666 };
    component.onCardClick(payload);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('handleButtonClick should emit onClickEvent with expected payload', () => {
    spyOn(component.onClickEvent, 'emit');
    const action = 'connect';
    const data = { id: 77, user_id: null, connection_meta: { room_id: 'room-77' } };

    component.handleButtonClick(action, data);
    expect(component.onClickEvent.emit).toHaveBeenCalledWith({
      data: data.id,
      type: action,
      rid: data.connection_meta.room_id,
      element: data
    });
  });

  it('showButton should return false for chat action when chatConfig != "true"', () => {
    // chatConfig is 'false' by default
    component.chatConfig = 'false';
    const event = { action: 'chat', hasCondition: false };
    const data = {};
    const result = component.showButton(event as any, data as any);
    expect(result).toBeFalse();
  });

  it('showButton should return true when hasCondition is false and not chat', () => {
    const event = { action: 'other', hasCondition: false };
    const data = {};
    const result = component.showButton(event as any, data as any);
    expect(result).toBeTrue();
  });

  it('showButton should return true when hasCondition is true and onCheck matches data', () => {
    const event = { action: 'other', hasCondition: true, onCheck: 'role', role: 'mentor' };
    const data = { role: 'mentor' };
    const result = component.showButton(event as any, data as any);
    expect(result).toBeTrue();
  });

  it('showButton should return false when hasCondition is true and onCheck does not match data', () => {
    const event = { action: 'other', hasCondition: true, onCheck: 'role', role: 'mentor' };
    const data = { role: 'mentee' };
    const result = component.showButton(event as any, data as any);
    expect(result).toBeFalse();
  });

  it('showButton chat should return true when chatConfig is "true"', async () => {
    // change getLocalData to return 'true' and re-run ngOnInit
    mockLocalStorage.getLocalData.and.returnValue(Promise.resolve('true'));

    // call ngOnInit again to pick up updated storage value
    await component.ngOnInit();

    const event = { action: 'chat', hasCondition: false };
    const data = {};
    expect(component.showButton(event as any, data as any)).toBeTrue();
  });
});
