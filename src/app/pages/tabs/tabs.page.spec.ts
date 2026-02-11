import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TabsPage } from './tabs.page';
import { LocalStorageService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service'; 
import { IonTabs } from '@ionic/angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  let localStorageSpy: any;
  let profileSpy: any;

  beforeEach(waitForAsync(() => {
    localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
    profileSpy = jasmine.createSpyObj('ProfileService', ['getUserRole', 'getProfileDetailsFromAPI']);

    TestBed.configureTestingModule({
      declarations: [TabsPage],
      providers: [
        { provide: LocalStorageService, useValue: localStorageSpy },
        { provide: ProfileService, useValue: profileSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tabChange', () => {
    it('should set activeTab and customIcon when stackId is requests', () => {
      const fakeElement = document.createElement('div');
      const tabsRef: Partial<IonTabs> = {
        outlet: {
          activatedView: {
            element: fakeElement,
            stackId: 'requests'
          }
        } as any
      } as Partial<IonTabs>;

      component.tabChange(tabsRef as IonTabs);

      expect(component['activeTab']).toBe(fakeElement);
      expect(component.customIcon).toBe('/assets/images/request_icon_solid_color.svg');
    });

    it('should set customIcon to dark when stackId is not requests', () => {
      const fakeElement = document.createElement('div');
      const tabsRef: Partial<IonTabs> = {
        outlet: {
          activatedView: {
            element: fakeElement,
            stackId: 'other'
          }
        } as any
      } as Partial<IonTabs>;

      component.tabChange(tabsRef as IonTabs);

      expect(component['activeTab']).toBe(fakeElement);
      expect(component.customIcon).toBe('/assets/images/request_icon_dark.svg');
    });
  });

  describe('propagateToActiveTab', () => {
    it('should dispatch event to active tab element', () => {
      const el = document.createElement('div');
      const spy = jasmine.createSpy('dispatchEvent');
      // replace dispatchEvent with spy
      (el as any).dispatchEvent = spy;
      (component as any).activeTab = el;

      component['propagateToActiveTab']('ionViewWillEnter');

      expect(spy).toHaveBeenCalled();
      const eventArg = spy.calls.mostRecent().args[0];
      expect(eventArg.type).toBe('ionViewWillEnter');
    });

    it('should not throw if activeTab is undefined', () => {
      (component as any).activeTab = undefined;
      expect(() => component['propagateToActiveTab']('ionViewDidEnter')).not.toThrow();
    });
  });

  describe('ionViewWillEnter', () => {
    it('should use localStorage user details if present and call getUserRole', async () => {
      const stored = { id: 'u1', name: 'User' };
      localStorageSpy.getLocalData.and.returnValue(Promise.resolve(stored));
      profileSpy.getUserRole.and.stub();

      await component.ionViewWillEnter();

      expect(localStorageSpy.getLocalData).toHaveBeenCalled();
      expect(component.user).toBe(stored);
      expect(profileSpy.getUserRole).toHaveBeenCalledWith(stored);
    });

    it('should call profile API when local storage has no user and call getUserRole', async () => {
      localStorageSpy.getLocalData.and.returnValue(Promise.resolve(null));
      const profileFromApi = { id: 'u2', name: 'ApiUser' };
      profileSpy.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(profileFromApi));

      await component.ionViewWillEnter();

      expect(localStorageSpy.getLocalData).toHaveBeenCalled();
      expect(profileSpy.getProfileDetailsFromAPI).toHaveBeenCalled();
      expect(component.user).toBe(profileFromApi);
      expect(profileSpy.getUserRole).toHaveBeenCalledWith(profileFromApi);
    });
  });

  describe('isCustomIcon', () => {
    it('should return true for valid image urls', () => {
      expect(component.isCustomIcon('/path/to/image.svg')).toBeTrue();
      expect(component.isCustomIcon('/path/to/image.png')).toBeTrue();
      expect(component.isCustomIcon('/path/to/image.jpeg')).toBeTrue();
    });

    it('should return false for non-image or empty', () => {
      expect(component.isCustomIcon('not-an-image')).toBeFalse();
      expect(component.isCustomIcon('')).toBeFalse();
      expect(component.isCustomIcon(null as any)).toBeFalse();
    });
  });

});
