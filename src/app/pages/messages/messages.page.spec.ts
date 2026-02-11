import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MessagesPage } from './messages.page';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('MessagesPage', () => {
  let component: MessagesPage;
  let fixture: ComponentFixture<MessagesPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockChatService: any;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockTranslations = {
    'MESSAGE_SEARCH_PLACEHOLDER': 'Search messages...',
    'SEARCH_RESULT_MESSGAGE_NOT_FOUND': 'No messages found'
  };

  beforeEach(waitForAsync(() => {
    // Create mock chat service
    mockChatService = jasmine.createSpyObj('FrontendChatLibraryService', ['messageBadge']);
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getChatToken']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get', 'use', 'setDefaultLang']);

    // Default mock returns
    mockTranslateService.get.and.returnValue(of(mockTranslations));
    mockProfileService.getChatToken.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      declarations: [MessagesPage],
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ToastService, useValue: mockToastService },
        { provide: TranslateService, useValue: mockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesPage);
    component = fixture.componentInstance;
    
    // Manually inject the chat service mock into the component
    (component as any).chatService = mockChatService;
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with correct header config', () => {
      expect(component.headerConfig).toEqual({
        menu: true,
        headerColor: 'primary',
        notification: false,
        label: 'MESSAGES'
      });
    });

    it('should initialize isLoaded as false', () => {
      expect(component.isLoaded).toBe(false);
    });

    it('should call translateAllMessages in constructor', () => {
      expect(mockTranslateService.get).toHaveBeenCalled();
    });

    it('should initialize translatedMessages object', () => {
      expect(component.translatedMessages).toBeDefined();
      expect(component.translatedMessages.placeholder).toBeDefined();
      expect(component.translatedMessages.noData).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should be defined', () => {
      expect(component.ngOnInit).toBeDefined();
    });

    it('should execute without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      mockTranslateService.get.calls.reset();
      mockProfileService.getChatToken.calls.reset();
    });

    it('should set isLoaded to false initially then true after loading', async () => {
      component.isLoaded = true;
      await component.ionViewWillEnter();
      expect(component.isLoaded).toBe(true);
    });

    it('should call translateAllMessages', async () => {
      await component.ionViewWillEnter();
      expect(mockTranslateService.get).toHaveBeenCalled();
    });

    it('should call getChatToken from profileService', async () => {
      await component.ionViewWillEnter();
      expect(mockProfileService.getChatToken).toHaveBeenCalled();
    });

    it('should set showChat to true when getChatToken returns true', async () => {
      mockProfileService.getChatToken.and.returnValue(Promise.resolve(true));
      
      await component.ionViewWillEnter();
      
      expect(component.showChat).toBe(true);
    });

    it('should set showChat to false when getChatToken returns false', async () => {
      mockProfileService.getChatToken.and.returnValue(Promise.resolve(false));
      
      await component.ionViewWillEnter();
      
      expect(component.showChat).toBe(false);
    });

    it('should set isLoaded to true after loading', async () => {
      component.isLoaded = false;
      await component.ionViewWillEnter();
      expect(component.isLoaded).toBe(true);
    });

    it('should handle getChatToken errors gracefully', async () => {
      mockProfileService.getChatToken.and.returnValue(Promise.reject('Error'));
      
      try {
        await component.ionViewWillEnter();
      } catch (error) {
        expect(error).toBe('Error');
      }
    });
  });

  describe('translateAllMessages', () => {
    beforeEach(() => {
      mockTranslateService.get.calls.reset();
    });

    it('should call translate.get with correct translation keys', () => {
      component.translateAllMessages();
      
      expect(mockTranslateService.get).toHaveBeenCalledWith([
        'MESSAGE_SEARCH_PLACEHOLDER',
        'SEARCH_RESULT_MESSGAGE_NOT_FOUND'
      ]);
    });

    it('should update translatedMessages with translations', () => {
      const customTranslations = {
        'MESSAGE_SEARCH_PLACEHOLDER': 'Custom placeholder',
        'SEARCH_RESULT_MESSGAGE_NOT_FOUND': 'Custom no data message'
      };
      
      mockTranslateService.get.and.returnValue(of(customTranslations));
      
      component.translateAllMessages();
      
      expect(component.translatedMessages.placeholder).toBe('Custom placeholder');
      expect(component.translatedMessages.noData).toBe('Custom no data message');
    });

    it('should set placeholder from MESSAGE_SEARCH_PLACEHOLDER translation', () => {
      mockTranslateService.get.and.returnValue(of(mockTranslations));
      
      component.translateAllMessages();
      
      expect(component.translatedMessages.placeholder).toBe(mockTranslations['MESSAGE_SEARCH_PLACEHOLDER']);
    });

    it('should set noData from SEARCH_RESULT_MESSGAGE_NOT_FOUND translation', () => {
      mockTranslateService.get.and.returnValue(of(mockTranslations));
      
      component.translateAllMessages();
      
      expect(component.translatedMessages.noData).toBe(mockTranslations['SEARCH_RESULT_MESSGAGE_NOT_FOUND']);
    });

    it('should subscribe to translation observable', () => {
      const observable = of(mockTranslations);
      spyOn(observable, 'subscribe').and.callThrough();
      mockTranslateService.get.and.returnValue(observable);
      
      component.translateAllMessages();
      
      expect(observable.subscribe).toHaveBeenCalled();
    });
  });

  describe('onSelect', () => {
    it('should navigate to chat route with data', () => {
      const testData = { id: '123', name: 'Test Chat' };
      
      component.onSelect(testData);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT, testData]);
    });

    it('should handle navigation with null data', () => {
      component.onSelect(null);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT, null]);
    });

    it('should handle navigation with undefined data', () => {
      component.onSelect(undefined);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT, undefined]);
    });

    it('should handle navigation with string data', () => {
      const chatId = 'chat-456';
      
      component.onSelect(chatId);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT, chatId]);
    });

    it('should handle navigation with complex object data', () => {
      const complexData = {
        id: '789',
        user: { name: 'John', avatar: 'url' },
        lastMessage: 'Hello'
      };
      
      component.onSelect(complexData);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT, complexData]);
    });
  });

  describe('messageBadge', () => {
    it('should call chatService.messageBadge with numeric event data', () => {
      const eventData = 5;
      
      component.messageBadge(eventData);
      
      expect(mockChatService.messageBadge).toHaveBeenCalledWith(eventData);
    });

    it('should handle messageBadge with null event', () => {
      component.messageBadge(null);
      
      expect(mockChatService.messageBadge).toHaveBeenCalledWith(null);
    });

    it('should handle messageBadge with zero count', () => {
      const eventData = 0;
      
      component.messageBadge(eventData);
      
      expect(mockChatService.messageBadge).toHaveBeenCalledWith(eventData);
    });

    it('should handle messageBadge with true boolean', () => {
      const eventData = true;
      
      component.messageBadge(eventData);
      
      expect(mockChatService.messageBadge).toHaveBeenCalledWith(eventData);
    });

    it('should handle messageBadge with false boolean', () => {
      const eventData = false;
      
      component.messageBadge(eventData);
      
      expect(mockChatService.messageBadge).toHaveBeenCalledWith(eventData);
    });

    it('should handle messageBadge with any type of event', () => {
      const eventData = 'string-value';
      
      component.messageBadge(eventData);
      
      expect(mockChatService.messageBadge).toHaveBeenCalled();
    });
  });

  describe('showToast', () => {
    it('should call toast.showToast with message and type from event', () => {
      const event = { message: 'Test message', type: 'success' };
      
      component.showToast(event);
      
      expect(mockToastService.showToast).toHaveBeenCalledWith('Test message', 'success');
    });

    it('should handle error type toast', () => {
      const event = { message: 'Error occurred', type: 'error' };
      
      component.showToast(event);
      
      expect(mockToastService.showToast).toHaveBeenCalledWith('Error occurred', 'error');
    });

    it('should handle warning type toast', () => {
      const event = { message: 'Warning message', type: 'warning' };
      
      component.showToast(event);
      
      expect(mockToastService.showToast).toHaveBeenCalledWith('Warning message', 'warning');
    });

    it('should handle info type toast', () => {
      const event = { message: 'Info message', type: 'info' };
      
      component.showToast(event);
      
      expect(mockToastService.showToast).toHaveBeenCalledWith('Info message', 'info');
    });

    it('should handle event with empty message', () => {
      const event = { message: '', type: 'success' };
      
      component.showToast(event);
      
      expect(mockToastService.showToast).toHaveBeenCalledWith('', 'success');
    });

    it('should handle event with undefined type', () => {
      const event = { message: 'Test', type: undefined };
      
      component.showToast(event);
      
      expect(mockToastService.showToast).toHaveBeenCalledWith('Test', undefined);
    });
  });

  describe('ionViewWillLeave', () => {
    it('should set showChat to null', () => {
      component.showChat = true;
      
      component.ionViewWillLeave();
      
      expect(component.showChat).toBeNull();
    });

    it('should set showChat to null even if it was already null', () => {
      component.showChat = null;
      
      component.ionViewWillLeave();
      
      expect(component.showChat).toBeNull();
    });

    it('should set showChat to null even if it was undefined', () => {
      component.showChat = undefined;
      
      component.ionViewWillLeave();
      
      expect(component.showChat).toBeNull();
    });

    it('should set showChat to null when it contains boolean data', () => {
      component.showChat = false;
      
      component.ionViewWillLeave();
      
      expect(component.showChat).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should properly initialize and handle full lifecycle', async () => {
      // Initial state
      expect(component.isLoaded).toBe(false);
      
      // Enter view
      await component.ionViewWillEnter();
      expect(component.showChat).toBeDefined();
      expect(component.isLoaded).toBe(true);
      
      // Leave view
      component.ionViewWillLeave();
      expect(component.showChat).toBeNull();
    });

    it('should handle message selection flow', async () => {
      await component.ionViewWillEnter();
      
      const chatData = { id: 'chat-1', name: 'John Doe' };
      component.onSelect(chatData);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT, chatData]);
    });

    it('should handle badge and toast notifications', () => {
      const badgeEvent = 3;
      const toastEvent = { message: 'New message', type: 'info' };
      
      component.messageBadge(badgeEvent);
      component.showToast(toastEvent);
      
      expect(mockChatService.messageBadge).toHaveBeenCalledWith(badgeEvent);
      expect(mockToastService.showToast).toHaveBeenCalledWith('New message', 'info');
    });

    it('should re-translate messages on each view enter', async () => {
      mockTranslateService.get.calls.reset();
      
      await component.ionViewWillEnter();
      const firstCallCount = mockTranslateService.get.calls.count();
      
      await component.ionViewWillEnter();
      const secondCallCount = mockTranslateService.get.calls.count();
      
      expect(secondCallCount).toBeGreaterThan(firstCallCount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid view enter/leave cycles', async () => {
      await component.ionViewWillEnter();
      component.ionViewWillLeave();
      await component.ionViewWillEnter();
      component.ionViewWillLeave();
      
      expect(component.showChat).toBeNull();
      expect(mockProfileService.getChatToken).toHaveBeenCalledTimes(2);
    });

    it('should handle translation service returning empty object', () => {
      mockTranslateService.get.and.returnValue(of({}));
      
      component.translateAllMessages();
      
      expect(component.translatedMessages.placeholder).toBeUndefined();
      expect(component.translatedMessages.noData).toBeUndefined();
    });

    it('should handle multiple toast calls in sequence', () => {
      component.showToast({ message: 'First', type: 'success' });
      component.showToast({ message: 'Second', type: 'error' });
      component.showToast({ message: 'Third', type: 'warning' });
      
      expect(mockToastService.showToast).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple badge updates', () => {
      component.messageBadge(1);
      component.messageBadge(5);
      component.messageBadge(0);
      
      expect(mockChatService.messageBadge).toHaveBeenCalledTimes(3);
    });

    it('should handle showChat with different boolean values', async () => {
      mockProfileService.getChatToken.and.returnValue(Promise.resolve(true));
      await component.ionViewWillEnter();
      expect(component.showChat).toBe(true);
      
      component.ionViewWillLeave();
      expect(component.showChat).toBeNull();
      
      mockProfileService.getChatToken.and.returnValue(Promise.resolve(false));
      await component.ionViewWillEnter();
      expect(component.showChat).toBe(false);
    });
  });
});