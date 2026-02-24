import { TestBed } from '@angular/core/testing';
import { DbService } from './db.service';
import { Storage } from '@ionic/storage-angular';

describe('DbService', () => {
  let service: DbService;
  let storageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const storageMock = jasmine.createSpyObj('Storage', ['create', 'set', 'get', 'clear']);

    TestBed.configureTestingModule({
      providers: [
        DbService,
        { provide: Storage, useValue: storageMock }
      ]
    });

    service = TestBed.inject(DbService);
    storageSpy = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should initialize storage successfully', async () => {
      const mockStorage = jasmine.createSpyObj('Storage', ['set', 'get', 'clear']);
      storageSpy.create.and.returnValue(Promise.resolve(mockStorage));

      await service.init();

      expect(storageSpy.create).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization without errors', async () => {
      storageSpy.create.and.returnValue(Promise.resolve(storageSpy));

      await expectAsync(service.init()).toBeResolved();
    });
  });

  describe('setItem', () => {
    it('should store item with key and value', async () => {
      const key = 'testKey';
      const value = 'testValue';
      storageSpy.set.and.returnValue(Promise.resolve(value));

      const result = await service.setItem(key, value);

      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
      expect(result).toBe(value);
    });

    it('should store object values', async () => {
      const key = 'userKey';
      const value = { name: 'John', age: 30 };
      storageSpy.set.and.returnValue(Promise.resolve(value));

      const result = await service.setItem(key, value);

      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
      expect(result).toEqual(value);
    });

    it('should store JSON string values', async () => {
      const key = 'formKey';
      const value = JSON.stringify({ formId: '123', data: 'test' });
      storageSpy.set.and.returnValue(Promise.resolve(value));

      const result = await service.setItem(key, value);

      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
      expect(result).toBe(value);
    });

    it('should store null values', async () => {
      const key = 'nullKey';
      const value = null;
      storageSpy.set.and.returnValue(Promise.resolve(value));

      const result = await service.setItem(key, value);

      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
      expect(result).toBeNull();
    });

    it('should store number values', async () => {
      const key = 'countKey';
      const value = 42;
      storageSpy.set.and.returnValue(Promise.resolve(value));

      const result = await service.setItem(key, value);

      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
      expect(result).toBe(value);
    });

    it('should handle storage errors', async () => {
      const key = 'errorKey';
      const value = 'errorValue';
      const error = new Error('Storage write error');
      storageSpy.set.and.returnValue(Promise.reject(error));

      await expectAsync(service.setItem(key, value)).toBeRejectedWith(error);
    });
  });

  describe('getItem', () => {
    it('should retrieve item by key', async () => {
      const key = 'testKey';
      const expectedValue = 'testValue';
      storageSpy.get.and.returnValue(Promise.resolve(expectedValue));

      const result = await service.getItem(key);

      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toBe(expectedValue);
    });

    it('should retrieve object values', async () => {
      const key = 'userKey';
      const expectedValue = { name: 'Jane', age: 25 };
      storageSpy.get.and.returnValue(Promise.resolve(expectedValue));

      const result = await service.getItem(key);

      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(expectedValue);
    });

    it('should return null for non-existent key', async () => {
      const key = 'nonExistentKey';
      storageSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.getItem(key);

      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it('should retrieve JSON string values', async () => {
      const key = 'jsonKey';
      const jsonValue = JSON.stringify({ id: '456', name: 'Test' });
      storageSpy.get.and.returnValue(Promise.resolve(jsonValue));

      const result = await service.getItem(key);

      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toBe(jsonValue);
    });

    it('should retrieve number values', async () => {
      const key = 'numberKey';
      const numberValue = 100;
      storageSpy.get.and.returnValue(Promise.resolve(numberValue));

      const result = await service.getItem(key);

      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toBe(numberValue);
    });

    it('should handle storage read errors', async () => {
      const key = 'errorKey';
      const error = new Error('Storage read error');
      storageSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getItem(key)).toBeRejectedWith(error);
    });
  });

  describe('clear', () => {
    it('should clear all storage', async () => {
      storageSpy.clear.and.returnValue(Promise.resolve());

      await service.clear();

      expect(storageSpy.clear).toHaveBeenCalledTimes(1);
    });

    it('should return result from storage clear', async () => {
      storageSpy.clear.and.returnValue(Promise.resolve(undefined));

      const result = await service.clear();

      expect(storageSpy.clear).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle clear errors', async () => {
      const error = new Error('Clear storage error');
      storageSpy.clear.and.returnValue(Promise.reject(error));

      await expectAsync(service.clear()).toBeRejectedWith(error);
    });

    it('should be callable multiple times', async () => {
      storageSpy.clear.and.returnValue(Promise.resolve());

      await service.clear();
      await service.clear();

      expect(storageSpy.clear).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should set and get the same value', async () => {
      const key = 'integrationKey';
      const value = 'integrationValue';
      
      storageSpy.set.and.returnValue(Promise.resolve(value));
      storageSpy.get.and.returnValue(Promise.resolve(value));

      await service.setItem(key, value);
      const result = await service.getItem(key);

      expect(result).toBe(value);
    });

    it('should handle set, get, and clear workflow', async () => {
      const key = 'workflowKey';
      const value = 'workflowValue';
      
      storageSpy.set.and.returnValue(Promise.resolve(value));
      storageSpy.get.and.returnValue(Promise.resolve(value));
      storageSpy.clear.and.returnValue(Promise.resolve());

      await service.setItem(key, value);
      const beforeClear = await service.getItem(key);
      await service.clear();

      expect(beforeClear).toBe(value);
      expect(storageSpy.clear).toHaveBeenCalled();
    });

    it('should handle multiple set operations', async () => {
      storageSpy.set.and.returnValue(Promise.resolve('value'));

      await service.setItem('key1', 'value1');
      await service.setItem('key2', 'value2');
      await service.setItem('key3', 'value3');

      expect(storageSpy.set).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple get operations', async () => {
      storageSpy.get.and.returnValue(Promise.resolve('value'));

      await service.getItem('key1');
      await service.getItem('key2');
      await service.getItem('key3');

      expect(storageSpy.get).toHaveBeenCalledTimes(3);
    });
  });
});