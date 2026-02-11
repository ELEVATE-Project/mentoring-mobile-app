import { TestBed } from '@angular/core/testing';
import { OrganisationService } from './organisation.service';
import { HttpService } from '../http/http.service';
import { ToastService } from '../toast.service';
import { LocalStorageService } from '../localstorage.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { urlConstants } from '../../constants/urlConstants';
import { localKeys } from '../../constants/localStorage.keys';

describe('OrganisationService', () => {
  let service: OrganisationService;
  let mockHttpService: jasmine.SpyObj<HttpService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    mockHttpService = jasmine.createSpyObj('HttpService', ['post', 'get']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', ['setLocalData']);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['put']);

    TestBed.configureTestingModule({
      providers: [
        OrganisationService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ToastService, useValue: mockToastService },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });
    service = TestBed.inject(OrganisationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requestOrgRole should post data and show toast on success', async () => {
    const mockResponse = { message: 'Success', result: 'Data' };
    mockHttpService.post.and.returnValue(Promise.resolve(mockResponse));

    const result = await service.requestOrgRole('role1', { key: 'val' });

    expect(mockHttpService.post).toHaveBeenCalledWith({
      url: urlConstants.API_URLS.REQUEST_TO_BECOME_MENTOR,
      payload: { role: 'role1', form_data: { key: 'val' } }
    });
    expect(mockLocalStorageService.setLocalData).toHaveBeenCalledWith(localKeys.IS_ROLE_REQUESTED, true);
    expect(mockToastService.showToast).toHaveBeenCalledWith('Success', 'success');
    expect(result).toBe('Data');
  });

  it('requestOrgRole should handle error gracefully', async () => {
    mockHttpService.post.and.returnValue(Promise.reject('Error'));
    await service.requestOrgRole('role1', {});
    expect(mockHttpService.post).toHaveBeenCalled();
    // Assuming method catches error and does nothing
  });

  it('getRequestedRoleDetails should find and return role details', async () => {
    const mockData = {
      result: {
        data: [
          { title: 'Other' },
          { title: 'Mentor', id: 1 }
        ]
      }
    };
    mockHttpService.get.and.returnValue(Promise.resolve(mockData));

    const result = await service.getRequestedRoleDetails('Mentor');

    expect(result).toEqual({ title: 'Mentor', id: 1 });
    expect(mockHttpService.get).toHaveBeenCalledWith({
      url: urlConstants.API_URLS.LIST_ORG_ROLES,
      payload: {}
    });
  });

  it('adminRequestList should post filters and return result', async () => {
    const mockResult = [{ id: 1 }];
    mockHttpService.post.and.returnValue(Promise.resolve({ result: mockResult }));

    const res = await service.adminRequestList(1, 10, 'pending');

    expect(mockHttpService.post).toHaveBeenCalledWith({
      url: `${urlConstants.API_URLS.ADMIN_MENTOR_REQUEST_LIST}?page=1&limit=10`,
      payload: { filters: { status: ['pending'] } }
    });
    expect(res).toBe(mockResult);
  });

  it('updateRequest should post update and return data', async () => {
    const mockResult = { success: true };
    mockHttpService.post.and.returnValue(Promise.resolve(mockResult));

    const res = await service.updateRequest('id1', 'approved');

    expect(mockHttpService.post).toHaveBeenCalledWith({
      url: urlConstants.API_URLS.ADMIN_UPDATE_REQUEST,
      payload: { request_id: 'id1', status: 'approved' }
    });
    expect(res).toBe(mockResult);
  });

  it('bulkUpload should post file path', async () => {
    const mockResult = { success: true };
    mockHttpService.post.and.returnValue(Promise.resolve(mockResult));

    const res = await service.bulkUpload('/path/to/csv', 'upload_url');

    expect(mockHttpService.post).toHaveBeenCalledWith({
      url: 'upload_url',
      payload: { file_path: '/path/to/csv' }
    });
    expect(res).toBe(mockResult);
  });

  it('getSignedUrl should get signed url replacing spaces in name', async () => {
    const mockResult = 'signed_url';
    mockHttpService.get.and.returnValue(Promise.resolve({ result: mockResult }));

    const res = await service.getSignedUrl('file name.jpg');

    expect(mockHttpService.get).toHaveBeenCalledWith({
      url: urlConstants.API_URLS.GET_FILE_UPLOAD_URL + 'file_name.jpg',
      payload: {}
    });
    expect(res).toBe(mockResult);
  });

  it('upload should put file using HttpClient', () => {
    mockHttpClient.put.and.returnValue(of('response'));

    service.upload('fileContent', { signedUrl: 'http://signed.url' });

    expect(mockHttpClient.put).toHaveBeenCalledWith(
      'http://signed.url',
      'fileContent',
      { headers: { "Content-Type": "multipart/form-data", "x-ms-blob-type": "BlockBlob" } }
    );
  });

  it('downloadCsv should get csv content', async () => {
    const mockResult = 'csv_data';
    mockHttpService.get.and.returnValue(Promise.resolve({ result: mockResult }));

    const res = await service.downloadCsv('download_url');

    expect(mockHttpService.get).toHaveBeenCalledWith({
      url: 'download_url',
      payload: {}
    });
    expect(res).toBe(mockResult);
  });
});
