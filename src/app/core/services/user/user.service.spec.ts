import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import * as jwtDecode from 'jwt-decode';

describe('UserService', () => {
  let service: UserService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem', 'clear']);
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [UserService]
    });
    
    service = TestBed.inject(UserService);
  });

  afterEach(() => {
    localStorageSpy.getItem.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserValue', () => {
    it('should return token when valid token exists in localStorage', async () => {
      const validToken = createMockToken(3600); // Token expires in 1 hour
      localStorageSpy.getItem.and.returnValue(validToken);

      const result = await service.getUserValue();

      expect(localStorageSpy.getItem).toHaveBeenCalledWith('accToken');
      expect(result).toBe(validToken);
      expect(service.token).toBe(validToken);
    });

    it('should return null when token is invalid', async () => {
      const expiredToken = createMockToken(-3600); // Token expired 1 hour ago
      localStorageSpy.getItem.and.returnValue(expiredToken);

      const result = await service.getUserValue();

      expect(result).toBeNull();
    });

    it('should return null when no token exists in localStorage', async () => {
      localStorageSpy.getItem.and.returnValue(null);

      const result = await service.getUserValue();

      expect(result).toBeNull();
    });

    it('should return null when localStorage throws an error', async () => {
      localStorageSpy.getItem.and.throwError('Storage error');

      const result = await service.getUserValue();

      expect(result).toBeNull();
    });

    it('should set token property when valid token is retrieved', async () => {
      const validToken = createMockToken(3600);
      localStorageSpy.getItem.and.returnValue(validToken);

      await service.getUserValue();

      expect(service.token).toBe(validToken);
    });
  });

  describe('validateToken', () => {
    it('should return true for a valid non-expired token', () => {
      const validToken = createMockToken(3600); // Expires in 1 hour

      const result = service.validateToken(validToken);

      expect(result).toBe(true);
    });

    it('should return false for an expired token', () => {
      const expiredToken = createMockToken(-3600); // Expired 1 hour ago

      const result = service.validateToken(expiredToken);

      expect(result).toBe(false);
    });

    it('should return false for an invalid token format', () => {
      const invalidToken = 'invalid.token.format';

      const result = service.validateToken(invalidToken);

      expect(result).toBe(false);
    });

    it('should return false for a malformed token', () => {
      const result = service.validateToken('not-a-jwt');

      expect(result).toBe(false);
    });

    it('should return false for an empty string', () => {
      const result = service.validateToken('');

      expect(result).toBe(false);
    });
  });

  describe('userEvent', () => {
    it('should have userEvent Subject defined', () => {
      expect(service.userEvent).toBeDefined();
    });

    it('should have userEventEmitted$ observable defined', () => {
      expect(service.userEventEmitted$).toBeDefined();
    });

    it('should emit values through userEvent Subject', (done) => {
      const testData = { userId: 123, name: 'Test User' };

      service.userEventEmitted$.subscribe(data => {
        expect(data).toEqual(testData);
        done();
      });

      service.userEvent.next(testData);
    });
  });
});

/**
 * Helper function to create a mock JWT token
 * @param expiresInSeconds - Number of seconds from now when token expires (negative for expired tokens)
 */
function createMockToken(expiresInSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;
  
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp, userId: 123 }));
  const signature = 'mock-signature';
  
  return `${header}.${payload}.${signature}`;
}