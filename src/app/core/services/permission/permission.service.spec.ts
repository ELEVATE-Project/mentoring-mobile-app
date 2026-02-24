import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { LocalStorageService } from '../localstorage.service';
import { HttpService } from '../http/http.service';
import { localKeys } from '../../constants/localStorage.keys';
import { actions } from '../../constants/permissionsConstant';

describe('PermissionService', () => {
  let service: PermissionService;
  let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  const mockUserDetails = {
    permissions: [
      {
        module: 'sessions',
        request_type: ['GET', 'POST'],
      },
      {
        module: 'users',
        request_type: ['GET'],
      },
      {
        module: 'mentors',
        request_type: ['GET', 'POST', 'PUT', 'DELETE'],
      }
    ]
  };

  beforeEach(() => {
    const localStorageSpy = jasmine.createSpyObj('LocalStorageService', [
      'getLocalData',
      'setLocalData'
    ]);
    const httpSpy = jasmine.createSpyObj('HttpService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: LocalStorageService, useValue: localStorageSpy },
        { provide: HttpService, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(PermissionService);
    localStorageServiceSpy = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
  });

  afterEach(() => {
    // Reset userPermissions after each test
    service.userPermissions = [];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('hasPermission', () => {
    it('should return true when user has the required permission with GET action', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      
      const permissions = {
        module: 'sessions',
        action: ['GET']
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBe(true);
      expect(localStorageServiceSpy.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
    });

    it('should return true when user has the required permission with POST action', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      
      const permissions = {
        module: 'sessions',
        action: ['POST']
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBe(true);
    });

    it('should return true when no action specified and defaults to GET', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      
      const permissions = {
        module: 'users',
        action: []
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBe(true);
    });

    it('should return false when user does not have the required permission', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      
      const permissions = {
        module: 'users',
        action: ['DELETE']
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBe(false);
    });

    it('should handle when module does not exist in user permissions', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      
      const permissions = {
        module: 'non-existent-module',
        action: ['GET']
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBeUndefined();
    });

    it('should return true when user has multiple permissions including required one', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      
      const permissions = {
        module: 'mentors',
        action: ['PUT']
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBe(true);
    });

    it('should handle null permissions parameter', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));

      const result = await service.hasPermission(null);

      expect(result).toBeUndefined();
    });

    it('should handle empty request_type array', async () => {
      const mockDataWithEmptyRequestType = {
        permissions: [
          {
            module: 'sessions',
            request_type: [],
          }
        ]
      };
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockDataWithEmptyRequestType));
      
      const permissions = {
        module: 'sessions',
        action: ['GET']
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBeUndefined();
    });

    it('should use GET as default action when action array is empty', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      
      const permissions = {
        module: 'sessions'
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBe(true);
    });
  });

  describe('fetchPermissions', () => {
    it('should fetch and store permissions from local storage', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));

      const result = await service.fetchPermissions();

      expect(localStorageServiceSpy.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(service.userPermissions).toEqual(mockUserDetails.permissions);
      expect(result).toEqual(mockUserDetails.permissions);
    });

    it('should handle when no data exists in local storage', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(null));

      const result = await service.fetchPermissions();

      expect(localStorageServiceSpy.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(result).toBeUndefined();
    });

    it('should handle when data is undefined', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(undefined));

      const result = await service.fetchPermissions();

      expect(result).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.reject('Error'));

      const result = await service.fetchPermissions();

      // Promise will resolve with undefined due to empty catch block
      expect(result).toBeUndefined();
    });

    it('should handle data without permissions property', async () => {
      const dataWithoutPermissions = { user: 'test' };
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(dataWithoutPermissions));

      const result = await service.fetchPermissions();

      expect(service.userPermissions).toBeUndefined();
      expect(result).toBeUndefined();
    });
  });

  describe('hasAdminAcess', () => {
    const userPermissions = [
      { module: 'sessions' },
      { module: 'users' },
      { module: 'mentors' }
    ];

    it('should return true when user has at least one matching permission', () => {
      const permissionArray = [
        { module: 'sessions' },
        { module: 'reports' }
      ];

      const result = service.hasAdminAcess(permissionArray, userPermissions);

      expect(result).toBe(true);
    });

    it('should return false when user has no matching permissions', () => {
      const permissionArray = [
        { module: 'reports' },
        { module: 'analytics' }
      ];

      const result = service.hasAdminAcess(permissionArray, userPermissions);

      expect(result).toBe(false);
    });

    it('should return true when multiple permissions match', () => {
      const permissionArray = [
        { module: 'sessions' },
        { module: 'users' },
        { module: 'mentors' }
      ];

      const result = service.hasAdminAcess(permissionArray, userPermissions);

      expect(result).toBe(true);
    });

    it('should return false when permissionArray is empty', () => {
      const permissionArray = [];

      const result = service.hasAdminAcess(permissionArray, userPermissions);

      expect(result).toBe(false);
    });

    it('should return false when userPermissions is empty', () => {
      const permissionArray = [{ module: 'sessions' }];
      const emptyUserPermissions = [];

      const result = service.hasAdminAcess(permissionArray, emptyUserPermissions);

      expect(result).toBe(false);
    });

    it('should handle case-sensitive module names', () => {
      const permissionArray = [{ module: 'Sessions' }];

      const result = service.hasAdminAcess(permissionArray, userPermissions);

      expect(result).toBe(false);
    });
  });

  describe('getPlatformConfig', () => {
    it('should get platform config successfully', async () => {
      const mockResponse = {
        result: {
          session_mentee_limit: 10,
          chat_config: { enabled: true }
        }
      };

      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));
      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());
      spyOn(service, 'setConfigInLocal');

      const result = await service.getPlatformConfig();

      expect(httpServiceSpy.get).toHaveBeenCalled();
      expect(service.setConfigInLocal).toHaveBeenCalledWith(mockResponse.result);
      expect(result).toEqual(mockResponse);
    });

    it('should return null when API call fails', async () => {
      httpServiceSpy.get.and.returnValue(Promise.reject('Error'));

      const result = await service.getPlatformConfig();

      expect(httpServiceSpy.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle empty result', async () => {
      const mockResponse = {
        result: {}
      };

      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));
      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());
      spyOn(service, 'setConfigInLocal');

      const result = await service.getPlatformConfig();

      expect(service.setConfigInLocal).toHaveBeenCalledWith(mockResponse.result);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('setConfigInLocal', () => {
    it('should set session mentee limit and chat config in local storage', () => {
      const result = {
        session_mentee_limit: 15,
        chat_config: { enabled: true, timeout: 3000 }
      };

      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());

      service.setConfigInLocal(result);

      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledWith(
        localKeys.MAX_MENTEE_ENROLLMENT_COUNT,
        result.session_mentee_limit
      );
      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledWith(
        localKeys.CHAT_CONFIG,
        result.chat_config
      );
      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledTimes(2);
    });

    it('should handle undefined values', () => {
      const result = {
        session_mentee_limit: undefined,
        chat_config: undefined
      };

      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());

      service.setConfigInLocal(result);

      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledWith(
        localKeys.MAX_MENTEE_ENROLLMENT_COUNT,
        undefined
      );
      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledWith(
        localKeys.CHAT_CONFIG,
        undefined
      );
    });

    it('should handle null values', () => {
      const result = {
        session_mentee_limit: null,
        chat_config: null
      };

      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());

      service.setConfigInLocal(result);

      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledWith(
        localKeys.MAX_MENTEE_ENROLLMENT_COUNT,
        null
      );
      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledWith(
        localKeys.CHAT_CONFIG,
        null
      );
    });

    it('should set zero as valid session mentee limit', () => {
      const result = {
        session_mentee_limit: 0,
        chat_config: { enabled: false }
      };

      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());

      service.setConfigInLocal(result);

      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledWith(
        localKeys.MAX_MENTEE_ENROLLMENT_COUNT,
        0
      );
    });
  });

  describe('Integration tests', () => {
    it('should fetch permissions and then check permission', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      
      await service.fetchPermissions();
      
      const permissions = {
        module: 'mentors',
        action: ['DELETE']
      };

      const result = await service.hasPermission(permissions);

      expect(result).toBe(true);
      expect(service.userPermissions.length).toBe(3);
    });

    it('should handle complete flow of getting config and storing it', async () => {
      const mockResponse = {
        result: {
          session_mentee_limit: 20,
          chat_config: { enabled: true, port: 8080 }
        }
      };

      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));
      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());

      const result = await service.getPlatformConfig();

      expect(httpServiceSpy.get).toHaveBeenCalled();
      expect(localStorageServiceSpy.setLocalData).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });
  });
});