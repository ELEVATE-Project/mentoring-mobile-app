import { TestBed } from '@angular/core/testing';
import { FormService } from './form.service';
import { HttpService, DbService } from 'src/app/core/services';
import { urlConstants } from 'src/app/core/constants/urlConstants';

describe('FormService', () => {
  let service: FormService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let dbServiceSpy: jasmine.SpyObj<DbService>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['post', 'get']);
    const dbSpy = jasmine.createSpyObj('DbService', ['getItem', 'setItem']);

    TestBed.configureTestingModule({
      providers: [
        FormService,
        { provide: HttpService, useValue: httpSpy },
        { provide: DbService, useValue: dbSpy }
      ]
    });

    service = TestBed.inject(FormService);
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    dbServiceSpy = TestBed.inject(DbService) as jasmine.SpyObj<DbService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getForm', () => {
    const formBody = { formId: 'test123', type: 'survey' };
    const mockFormData = {
      data: { fields: [{ name: 'field1' }] },
      ttl: new Date(Date.now() + 10000).getTime()
    };

    it('should return cached form if not expired', async () => {
      const cachedForm = JSON.stringify(mockFormData);
      dbServiceSpy.getItem.and.returnValue(Promise.resolve(cachedForm));

      const result = await service.getForm(formBody);

      expect(dbServiceSpy.getItem).toHaveBeenCalledWith('test123_survey');
      expect(result).toEqual(mockFormData);
      expect(httpServiceSpy.post).not.toHaveBeenCalled();
    });

    it('should fetch from API if cached form is expired', async () => {
      const expiredForm = {
        data: { fields: [{ name: 'field1' }] },
        ttl: new Date(Date.now() - 10000).getTime()
      };
      const cachedForm = JSON.stringify(expiredForm);
      const apiResponse = {
        result: {
          data: { fields: [{ name: 'newField' }] }
        }
      };

      dbServiceSpy.getItem.and.returnValue(Promise.resolve(cachedForm));
      httpServiceSpy.post.and.returnValue(Promise.resolve(apiResponse));
      dbServiceSpy.setItem.and.returnValue(Promise.resolve());

      const result = await service.getForm(formBody);

      expect(httpServiceSpy.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.FORM_READ,
        payload: formBody
      });
      expect(result).toEqual(apiResponse.result);
    });

    it('should fetch from API if no cached form exists', async () => {
      const apiResponse = {
        result: {
          data: { fields: [{ name: 'newField' }] }
        }
      };

      dbServiceSpy.getItem.and.returnValue(Promise.resolve(null));
      httpServiceSpy.post.and.returnValue(Promise.resolve(apiResponse));
      dbServiceSpy.setItem.and.returnValue(Promise.resolve());

      const result = await service.getForm(formBody);

      expect(httpServiceSpy.post).toHaveBeenCalled();
      expect(dbServiceSpy.setItem).toHaveBeenCalled();
      expect(result).toEqual(apiResponse.result);
    });

    it('should return response without storing if fields are not present', async () => {
      const apiResponse = {
        result: { message: 'Form not found' }
      };

      dbServiceSpy.getItem.and.returnValue(Promise.resolve(null));
      httpServiceSpy.post.and.returnValue(Promise.resolve(apiResponse));

      const result = await service.getForm(formBody);

      expect(result).toEqual(apiResponse.result);
      expect(dbServiceSpy.setItem).not.toHaveBeenCalled();
    });

    it('should store form in db with correct TTL', async () => {
      const apiResponse = {
        result: {
          data: { fields: [{ name: 'field1' }] }
        }
      };

      dbServiceSpy.getItem.and.returnValue(Promise.resolve(null));
      httpServiceSpy.post.and.returnValue(Promise.resolve(apiResponse));
      dbServiceSpy.setItem.and.returnValue(Promise.resolve());

      await service.getForm(formBody);

      expect(dbServiceSpy.setItem).toHaveBeenCalledWith(
        'test123_survey',
        jasmine.any(String)
      );
    });
  });

  describe('getUniqueKey', () => {
    it('should return underscore separated values', () => {
      const obj = { formId: 'test123', type: 'survey', version: 'v1' };
      const result = service.getUniqueKey(obj);
      expect(result).toBe('test123_survey_v1');
    });

    it('should handle single property object', () => {
      const obj = { id: 'abc' };
      const result = service.getUniqueKey(obj);
      expect(result).toBe('abc');
    });
  });

  describe('timeToExpire', () => {
    it('should return unix timestamp for future time', () => {
      const hours = 24;
      const result = service.timeToExpire(hours);
      const expected = Date.now() + (1000 * 60 * 60 * hours);
      expect(result).toBeGreaterThan(Date.now());
      expect(result).toBeLessThanOrEqual(expected + 100);
    });
  });

  describe('checkIfexpired', () => {
    it('should return true if timestamp is in the past', () => {
      const pastTime = Date.now() - 10000;
      const result = service.checkIfexpired(pastTime);
      expect(result).toBe(true);
    });

    it('should return false if timestamp is in the future', () => {
      const futureTime = Date.now() + 10000;
      const result = service.checkIfexpired(futureTime);
      expect(result).toBe(false);
    });
  });

  describe('getEntities', () => {
    it('should fetch entities with payload when entityTypes are provided', async () => {
      const entityTypes = ['state', 'district'];
      const type = 'location';
      const mockResponse = {
        result: {
          entity_types: [{ id: '1', value: 'state' }]
        }
      };

      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getEntities(entityTypes, type);

      expect(httpServiceSpy.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.GET_ENTITY_LIST[type],
        payload: { value: entityTypes }
      });
      expect(result).toEqual(mockResponse.result.entity_types);
    });

    it('should fetch entities with empty payload when no entityTypes', async () => {
      const entityTypes = [];
      const type = 'role';
      const mockResponse = {
        result: {
          entity_types: [{ id: '1', value: 'teacher' }]
        }
      };

      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getEntities(entityTypes, type);

      expect(httpServiceSpy.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.GET_ENTITY_LIST[type],
        payload: {}
      });
      expect(result).toEqual(mockResponse.result.entity_types);
    });

    it('should return data if entity_types is not present', async () => {
      const entityTypes = ['state'];
      const type = 'location';
      const mockResponse = { result: { data: 'some data' } };

      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getEntities(entityTypes, type);

      expect(result).toEqual(mockResponse);
    });

    it('should handle errors gracefully', async () => {
      const entityTypes = ['state'];
      const type = 'location';

      httpServiceSpy.post.and.returnValue(Promise.reject('error'));

      const result = await service.getEntities(entityTypes, type);

      expect(result).toBeUndefined();
    });
  });

  describe('getEntityNames', () => {
    it('should extract entity types from form controls with meta', () => {
      const formData = {
        controls: [
          { name: 'field1', meta: { entityType: 'state' } },
          { name: 'field2', meta: { entityType: 'district' } },
          { name: 'field3' }
        ]
      };

      const result = service.getEntityNames(formData);

      expect(result).toEqual(['state', 'district']);
    });

    it('should return empty array if no controls have meta.entityType', () => {
      const formData = {
        controls: [
          { name: 'field1' },
          { name: 'field2', meta: {} }
        ]
      };

      const result = service.getEntityNames(formData);

      expect(result).toEqual([]);
    });
  });

  describe('populateEntity', () => {
    it('should populate entity options and meta for matching controls', async () => {
      const formData = {
        controls: [
          { name: 'state', validators: {} },
          { name: 'district', validators: {} }
        ]
      };
      const entityList = [
        {
          value: 'state',
          id: 'state-id',
          allow_custom_entities: true,
          allow_filtering: false,
          required: true,
          entities: [
            { label: 'Kerala', value: 'KL' },
            { label: 'Tamil Nadu', value: 'TN' }
          ]
        }
      ];

      const result = await service.populateEntity(formData, entityList);

      expect(result.controls[0].options).toEqual([
        { label: 'Kerala', value: 'KL' },
        { label: 'Tamil Nadu', value: 'TN' }
      ]);
      expect(result.controls[0].meta.entityId).toBe('state-id');
      expect(result.controls[0].validators.required).toBe(true);
    });

    it('should not modify controls without matching entities', async () => {
      const formData = {
        controls: [{ name: 'unknown', validators: {} }]
      };
      const entityList = [
        {
          value: 'state',
          id: 'state-id',
          entities: []
        }
      ];

      const result = await service.populateEntity(formData, entityList);

      expect(result.controls[0].options).toBeUndefined();
    });
  });

  describe('formatEntityOptions', () => {
    it('should format standard entity types correctly', async () => {
      const existingData = {
        state: { label: 'Kerala', value: 'KL' },
        district: { label: 'Ernakulam', value: 'EKM' }
      };
      const entityList = ['state', 'district'];

      const result = await service.formatEntityOptions(existingData, entityList);

      expect(result.state).toEqual({ label: 'Kerala', value: 'KL' });
      expect(result.district).toEqual({ label: 'Ernakulam', value: 'EKM' });
    });

    it('should format array entity types correctly', async () => {
      const existingData = {
        subjects: [
          { label: 'Math', value: 'math' },
          { label: 'Other Subject', value: 'other' }
        ]
      };
      const entityList = ['subjects'];

      const result = await service.formatEntityOptions(existingData, entityList);

      expect(result.subjects[0]).toEqual({ label: 'Math', value: 'math', type: 'math' });
      expect(result.subjects[1]).toEqual({ label: 'Other Subject', value: 'Other Subject', type: 'other' });
    });

    it('should handle mixed entity types', async () => {
      const existingData = {
        state: { label: 'Kerala', value: 'KL' },
        subjects: [{ label: 'Science', value: 'science' }]
      };
      const entityList = ['state', 'subjects'];

      const result = await service.formatEntityOptions(existingData, entityList);

      expect(result.state).toBeDefined();
      expect(Array.isArray(result.subjects)).toBe(true);
    });
  });

  describe('filterList', () => {
    it('should fetch filter list with correct parameters', async () => {
      const obj = { org: 'org123', filterType: 'location' };
      const mockResponse = {
        result: [{ id: '1', name: 'Filter1' }]
      };

      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.filterList(obj);

      expect(httpServiceSpy.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.FILTER_LIST + '&organization=org123&filter_type=location',
        payload: {}
      });
      expect(result).toEqual(mockResponse.result);
    });

    it('should return null on error', async () => {
      const obj = { org: 'org123', filterType: 'location' };

      httpServiceSpy.get.and.returnValue(Promise.reject('error'));

      const result = await service.filterList(obj);

      expect(result).toBeNull();
    });
  });
});