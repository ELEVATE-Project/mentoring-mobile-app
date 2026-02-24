import 'zone.js';
import 'zone.js/testing';

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/core/services';
import { PageHeaderComponent } from './page-header.component';
import { of } from 'rxjs';
import { CommonRoutes } from 'src/global.routes';
import { PopoverMenuComponent } from 'src/app/popover-menu/popover-menu.component';
import { TranslateModule } from '@ngx-translate/core';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;
  let mockNavController: any;
  let mockRouter: any;
  let mockUtilService: any;
  let mockPopoverController: any;

  beforeEach(waitForAsync(() => {
    mockNavController = {
      pop: jasmine.createSpy('pop')
    };

    mockRouter = {
      url: '/some/url'
    };

    mockUtilService = {
      hasBadge$: of(true)
    };

    mockPopoverController = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: 'some-action' }))
      }))
    };

    TestBed.configureTestingModule({
      declarations: [PageHeaderComponent],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        { provide: NavController, useValue: mockNavController },
        { provide: Router, useValue: mockRouter },
        { provide: UtilService, useValue: mockUtilService },
        { provide: PopoverController, useValue: mockPopoverController }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to hasBadge$ on init', () => {
    expect(component.hasBadge).toBeTrue();
  });

  it('should emit actionEvent onAction', () => {
    spyOn(component.actionEvent, 'next');
    const event = { target: {} };
    component.onAction(event);
    expect(component.actionEvent.next).toHaveBeenCalledWith(event);
  });

  it('should pop navigation onBack if not on home', () => {
    mockRouter.url = '/some/other/url';
    component.onBack();
    expect(mockNavController.pop).toHaveBeenCalled();
  });

  it('should redirect to home onBack if on home tab', () => {
    mockRouter.url = `/${CommonRoutes.TABS}/${CommonRoutes.HOME}`;
    spyOn(component, 'redirectToHome');

    component.onBack();

    expect(mockNavController.pop).not.toHaveBeenCalled();
    expect(component.redirectToHome).toHaveBeenCalled();
  });

  describe('openPopover', () => {
    it('should create and present popover, and handle action on dismiss', async () => {
      const event = new Event('click');
      spyOn(component, 'handleAction');

      await component.openPopover(event);

      expect(mockPopoverController.create).toHaveBeenCalledWith({
        component: PopoverMenuComponent,
        event: event,
        translucent: true,
        componentProps: {
          actions: []
        }
      });
      // specific spy verification for present is tricky as it's on the object returned by create
      // but we mocked the return value in beforeEach so it should be fine if we had access to the spy.
      // In beforeEach: 
      // create returns { present: spy, onDidDismiss: spy returning {data: 'some-action'} }

      // Since we can't easily access the created object's spy from here without refactoring the mock in beforeEach to store it,
      // let's at least verify handleAction is called because onDidDismiss returns data.
      expect(component.handleAction).toHaveBeenCalledWith('some-action');
    });

    it('should not handle action if no data returned', async () => {
      const event = new Event('click');
      mockPopoverController.create.and.returnValue(Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: null }))
      }));
      spyOn(component, 'handleAction');

      await component.openPopover(event);

      expect(component.handleAction).not.toHaveBeenCalled();
    });
  });

  describe('handleAction', () => {
    it('should emit block action', () => {
      spyOn(component.actionEvent, 'next');
      component.handleAction('block');
      expect(component.actionEvent.next).toHaveBeenCalledWith('block');
    });

    it('should emit share action', () => {
      spyOn(component.actionEvent, 'next');
      component.handleAction('share');
      expect(component.actionEvent.next).toHaveBeenCalledWith('share');
    });

    it('should not emit for unknown action', () => {
      spyOn(component.actionEvent, 'next');
      component.handleAction('unknown');
      expect(component.actionEvent.next).not.toHaveBeenCalled();
    });
  });


});