import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ChatRequestPage } from './chat-request.page';
import { HttpService, ToastService, UtilService } from 'src/app/core/services';
import { CHAT_MESSAGES } from 'src/app/core/constants/chatConstants';
import { CommonRoutes } from 'src/global.routes';
import { FormsModule } from '@angular/forms';

describe('ChatRequestPage', () => {
  let component: ChatRequestPage;
  let fixture: ComponentFixture<ChatRequestPage>;
  let httpService: jasmine.SpyObj<HttpService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let utilService: jasmine.SpyObj<UtilService>;
  let router: jasmine.SpyObj<Router>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let activatedRoute: any;
  let navController: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    const httpServiceSpy = jasmine.createSpyObj('HttpService', ['post']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', ['alertPopup']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack']);

    activatedRoute = {
      params: of({ id: '123' }),
      snapshot: {
        params: { id: '123' }
      }
    };

    TestBed.configureTestingModule({
      declarations: [ChatRequestPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        TranslateModule.forRoot(),
        FormsModule
      ],
      providers: [
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: NavController, useValue: navControllerSpy },
        AlertController
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatRequestPage);
    component = fixture.componentInstance;
    httpService = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    utilService = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.message).toBe('Hi, I would like to connect with you.');
    expect(component.headerConfig).toEqual({
      menu: false,
      headerColor: 'primary'
    });
    expect(component.messageLimit).toBe(CHAT_MESSAGES.MESSAGE_TEXT_LIMIT);
  });

  it('should extract id from route params', () => {
    expect(component.id).toBe('123');
  });

  describe('ngOnInit', () => {
    it('should call getConnectionInfo on init', () => {
      spyOn(component, 'getConnectionInfo');
      component.ngOnInit();
      expect(component.getConnectionInfo).toHaveBeenCalled();
    });
  });

  describe('getConnectionInfo', () => {
    it('should fetch connection info and set status to PENDING if no status returned', waitForAsync(() => {
      const mockResponse = {
        result: {
          id: '1',
          user_id: '123',
          created_by: '456',
          user_details: { name: 'John Doe' }
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.getConnectionInfo();

      fixture.whenStable().then(() => {
        expect(httpService.post).toHaveBeenCalled();
        expect(component.info.status).toBe('PENDING');
      });
    }));

    it('should clear message when status is REQUESTED', waitForAsync(() => {
      const mockResponse = {
        result: {
          status: 'REQUESTED',
          user_id: '123',
          created_by: '456',
          user_details: { name: 'John Doe' }
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.getConnectionInfo();

      fixture.whenStable().then(() => {
        expect(component.message).toBe('');
      });
    }));

    it('should navigate to chat when status is ACCEPTED', waitForAsync(() => {
      const mockResponse = {
        result: {
          status: 'ACCEPTED',
          id: 'conn123',
          meta: { room_id: 'room456' },
          user_id: '123',
          created_by: '456'
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.getConnectionInfo();

      fixture.whenStable().then(() => {
        expect(router.navigate).toHaveBeenCalledWith(
          [CommonRoutes.CHAT, 'room456'],
          { queryParams: { id: 'conn123' }, replaceUrl: true }
        );
      });
    }));

    it('should set INITIATOR messages when created_by equals user_id', waitForAsync(() => {
      const mockResponse = {
        result: {
          user_id: '123',
          created_by: '123',
          user_details: { name: 'John Doe' }
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.getConnectionInfo();

      fixture.whenStable().then(() => {
        expect(component.messages).toEqual(CHAT_MESSAGES.INITIATOR);
      });
    }));

    it('should set RECEIVER messages when created_by does not equal user_id', waitForAsync(() => {
      const mockResponse = {
        result: {
          user_id: '123',
          created_by: '456',
          user_details: { name: 'John Doe' }
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.getConnectionInfo();

      fixture.whenStable().then(() => {
        expect(component.messages).toEqual(CHAT_MESSAGES.RECEIVER);
      });
    }));
  });

  describe('sendRequest', () => {
    beforeEach(() => {
      component.id = '123';
      component.message = 'Test message';
    });

    it('should not send request if message is empty or whitespace', () => {
      component.message = '   ';
      component.sendRequest();
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should show error toast if message exceeds limit', () => {
      component.message = 'a'.repeat(component.messageLimit + 1);
      component.sendRequest();
      expect(toastService.showToast).toHaveBeenCalledWith('MESSAGE_TEXT_LIMIT', 'danger');
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should send request successfully with valid message', waitForAsync(() => {
      const mockResponse = { result: { status: 'REQUESTED' } };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));
      spyOn(component, 'getConnectionInfo');

      component.sendRequest();

      fixture.whenStable().then(() => {
        expect(httpService.post).toHaveBeenCalled();
        expect(component.info.status).toBe('REQUESTED');
        expect(component.getConnectionInfo).toHaveBeenCalled();
      });
    }));

    it('should call API with correct payload', waitForAsync(() => {
      const mockResponse = { result: {} };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.sendRequest();

      fixture.whenStable().then(() => {
        const callArgs = httpService.post.calls.first().args[0];
        expect(callArgs.payload.user_id).toBe('123');
        expect(callArgs.payload.message).toBe('Test message');
      });
    }));
  });

  describe('acceptRequest', () => {
    beforeEach(() => {
      component.id = '123';
      component.info = {
        user_details: { name: 'Jane Doe' }
      };
    });

    it('should accept request and navigate to chat', waitForAsync(() => {
      const mockResponse = {
        result: {
          id: 'conn123',
          meta: { room_id: 'room789' }
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));
      translateService.instant.and.returnValue('Accepted message request from Jane Doe');

      component.acceptRequest();

      fixture.whenStable().then(() => {
        expect(httpService.post).toHaveBeenCalled();
        expect(toastService.showToast).toHaveBeenCalledWith(
          'Accepted message request from Jane Doe',
          'success'
        );
        expect(component.info.status).toBe('ACCEPTED');
        expect(router.navigate).toHaveBeenCalledWith(
          [CommonRoutes.CHAT, 'room789'],
          { replaceUrl: true, queryParams: { id: 'conn123' } }
        );
      });
    }));

    it('should use default name if user details name is not available', waitForAsync(() => {
      component.info = { user_details: {} };
      const mockResponse = {
        result: {
          id: 'conn123',
          meta: { room_id: 'room789' }
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));
      translateService.instant.and.returnValue('Accepted message request from the user');

      component.acceptRequest();

      fixture.whenStable().then(() => {
        expect(translateService.instant).toHaveBeenCalledWith(
          'ACCEPTED_MESSAGE_REQ',
          { name: 'the user' }
        );
      });
    }));
  });

  describe('rejectConfirmation', () => {
    it('should show confirmation dialog and reject on confirm', waitForAsync(() => {
      const mockTranslations = {
        'MESSAGE_REQ_REJECT': 'Are you sure you want to reject?',
        'REJECT': 'Reject',
        'CANCEL': 'Cancel'
      };
      translateService.get.and.returnValue(of(mockTranslations));
      utilService.alertPopup.and.returnValue(Promise.resolve(true));
      spyOn(component, 'rejectRequest');

      component.rejectConfirmation();

      fixture.whenStable().then(() => {
        expect(utilService.alertPopup).toHaveBeenCalled();
        expect(component.rejectRequest).toHaveBeenCalled();
      });
    }));

    it('should not reject if user cancels confirmation', waitForAsync(() => {
      const mockTranslations = {
        'MESSAGE_REQ_REJECT': 'Are you sure?',
        'REJECT': 'Reject',
        'CANCEL': 'Cancel'
      };
      translateService.get.and.returnValue(of(mockTranslations));
      utilService.alertPopup.and.returnValue(Promise.resolve(false));
      spyOn(component, 'rejectRequest');

      component.rejectConfirmation();

      fixture.whenStable().then(() => {
        expect(utilService.alertPopup).toHaveBeenCalled();
        expect(component.rejectRequest).not.toHaveBeenCalled();
      });
    }));
  });

  describe('rejectRequest', () => {
    beforeEach(() => {
      component.id = '123';
    });

    it('should reject request and show toast', waitForAsync(() => {
      const mockResponse = { result: {} };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.rejectRequest();

      fixture.whenStable().then(() => {
        expect(httpService.post).toHaveBeenCalled();
        expect(component.info.status).toBe('REJECTED');
        expect(component.messages).toEqual(CHAT_MESSAGES.RECEIVER);
        expect(toastService.showToast).toHaveBeenCalledWith('REJECTED_MESSAGE_REQ', 'danger');
      });
    }));

    it('should call API with correct payload', waitForAsync(() => {
      const mockResponse = { result: {} };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.rejectRequest();

      fixture.whenStable().then(() => {
        const callArgs = httpService.post.calls.first().args[0];
        expect(callArgs.payload.user_id).toBe('123');
      });
    }));
  });

  describe('goToProfile', () => {
    it('should navigate to mentor details page', () => {
      component.id = '123';
      component.goToProfile();
      expect(router.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, '123']);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty response from getConnectionInfo', waitForAsync(() => {
      httpService.post.and.returnValue(Promise.resolve({ result: null }));
      
      component.getConnectionInfo();
      
      fixture.whenStable().then(() => {
        expect(component.info).toBeNull();
      });
    }));

    it('should handle message with exact character limit', () => {
      component.message = 'a'.repeat(component.messageLimit);
      const mockResponse = { result: {} };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));
      spyOn(component, 'getConnectionInfo');
      
      component.sendRequest();
      
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should trim whitespace from message before validation', () => {
      component.message = '  ';
      component.sendRequest();
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should handle response without meta in acceptRequest', waitForAsync(() => {
      component.info = { user_details: { name: 'Test User' } };
      const mockResponse = {
        result: {
          id: 'conn123',
          meta: null
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));
      translateService.instant.and.returnValue('Accepted');

      component.acceptRequest();

      fixture.whenStable().then(() => {
        expect(component.info.status).toBe('ACCEPTED');
      });
    }));

    it('should handle translation errors gracefully', waitForAsync(() => {
      const mockTranslations = {};
      translateService.get.and.returnValue(of(mockTranslations));
      utilService.alertPopup.and.returnValue(Promise.resolve(true));
      spyOn(component, 'rejectRequest');

      component.rejectConfirmation();

      fixture.whenStable().then(() => {
        expect(utilService.alertPopup).toHaveBeenCalled();
      });
    }));
  });

  describe('Message validation', () => {
    beforeEach(() => {
      component.id = '123';
    });

    it('should trim leading whitespace before checking if empty', () => {
      component.message = '   hello';
      const mockResponse = { result: {} };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));
      
      component.sendRequest();
      
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should handle message at exactly the limit boundary', () => {
      component.message = 'a'.repeat(component.messageLimit);
      const mockResponse = { result: {} };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));
      
      component.sendRequest();
      
      expect(httpService.post).toHaveBeenCalled();
      expect(toastService.showToast).not.toHaveBeenCalled();
    });

    it('should reject message one character over limit', () => {
      component.message = 'a'.repeat(component.messageLimit + 1);
      
      component.sendRequest();
      
      expect(toastService.showToast).toHaveBeenCalledWith('MESSAGE_TEXT_LIMIT', 'danger');
      expect(httpService.post).not.toHaveBeenCalled();
    });
  });

  describe('Constructor', () => {
    it('should subscribe to route params', () => {
      expect(component.id).toBe('123');
    });
  });

  describe('Status handling', () => {
    it('should preserve existing status if already set', waitForAsync(() => {
      const mockResponse = {
        result: {
          status: 'PENDING',
          user_id: '123',
          created_by: '456'
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.getConnectionInfo();

      fixture.whenStable().then(() => {
        expect(component.info.status).toBe('PENDING');
      });
    }));

    it('should handle REJECTED status correctly', waitForAsync(() => {
      const mockResponse = {
        result: {
          status: 'REJECTED',
          user_id: '123',
          created_by: '456'
        }
      };
      httpService.post.and.returnValue(Promise.resolve(mockResponse));

      component.getConnectionInfo();

      fixture.whenStable().then(() => {
        expect(component.info.status).toBe('REJECTED');
      });
    }));
  });
});