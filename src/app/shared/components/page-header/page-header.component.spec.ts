import 'zone.js';
import 'zone.js/testing';

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/core/services';
import { PageHeaderComponent } from './page-header.component';
import { of } from 'rxjs';
import { CommonRoutes } from 'src/global.routes';
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


});