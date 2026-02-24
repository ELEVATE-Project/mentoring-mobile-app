import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SessionCardTemplateComponent } from './session-card-template.component';
import { ToastService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SessionCardTemplateComponent', () => {
  let component: SessionCardTemplateComponent;
  let fixture: ComponentFixture<SessionCardTemplateComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockToast = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      declarations: [SessionCardTemplateComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToast }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionCardTemplateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should convert startDate to locale string timestamp', () => {
      component.data = {
        startDate: '2024-01-01T10:00:00'
      };

      component.ngOnInit();

      expect(component.data.startDate).toContain(','); // locale string contains comma
    });

    it('should not throw if startDate is invalid', () => {
      component.data = {
        startDate: null
      };

      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('onAction', () => {
    it('should emit action event with data and type', () => {
      spyOn(component.onClickEvent, 'emit');
      const data = { id: '1' };
      const type = 'JOIN';

      component.onAction(data, type);

      expect(component.onClickEvent.emit).toHaveBeenCalledWith({
        data,
        type
      });
    });

    it('should emit even when data is null', () => {
      spyOn(component.onClickEvent, 'emit');

      component.onAction(null, 'START');

      expect(component.onClickEvent.emit).toHaveBeenCalledWith({
        data: null,
        type: 'START'
      });
    });
  });

  describe('onCardClick', () => {
    it('should navigate using sessionId when present', () => {
      const data = { sessionId: 'session123' };

      component.onCardClick(data);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [`/${CommonRoutes.SESSIONS_DETAILS}/session123`],
        { replaceUrl: true }
      );
    });

    it('should navigate using _id when sessionId is not present', () => {
      const data = { _id: 'mongo123' };

      component.onCardClick(data);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [`/${CommonRoutes.SESSIONS_DETAILS}/mongo123`],
        { replaceUrl: true }
      );
    });

    it('should not throw when data is empty object', () => {
      expect(() => component.onCardClick({})).not.toThrow();
    });
  });

  describe('Input bindings', () => {
    it('should accept showEnroll input', () => {
      component.showEnroll = true;
      expect(component.showEnroll).toBeTrue();
    });

    it('should accept showStart input', () => {
      component.showStart = true;
      expect(component.showStart).toBeTrue();
    });

    it('should accept buttonConfig input', () => {
      component.buttonConfig = { label: 'JOIN' };
      expect(component.buttonConfig.label).toBe('JOIN');
    });
  });
});
