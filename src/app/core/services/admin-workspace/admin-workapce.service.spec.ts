import { TestBed } from '@angular/core/testing';
import { AdminWorkapceService } from './admin-workapce.service';
import { HttpService } from '../http/http.service';
import { UtilService } from '../util/util.service';
import { SessionService } from '../session/session.service';
import { ToastService } from '../toast.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { urlConstants } from '../../constants/urlConstants';

describe('AdminWorkapceService', () => {
  let service: AdminWorkapceService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['get', 'getFile']);
    const utilSpy = jasmine.createSpyObj('UtilService', ['alertPopup', 'parseAndDownloadCSV']);
    const sessionSpy = jasmine.createSpyObj('SessionService', ['deleteSession']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminWorkapceService,
        { provide: HttpService, useValue: httpSpy },
        { provide: UtilService, useValue: utilSpy },
        { provide: SessionService, useValue: sessionSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(AdminWorkapceService);
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    utilServiceSpy = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
    sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get created sessions by session manager', async () => {
    const mockResult = { result: { data: 'test session' } };
    const obj = { page: 1, limit: 10, searchText: 'test' };
    httpServiceSpy.get.and.returnValue(Promise.resolve(mockResult));

    const result = await service.createdSessionBySessionManager(obj);
    expect(httpServiceSpy.get).toHaveBeenCalled();
    expect(result).toEqual(mockResult.result);
  });

  it('should return false on error fetching sessions', async () => {
    const obj = { page: 1, limit: 10, searchText: 'test' };
    httpServiceSpy.get.and.returnValue(Promise.reject('error'));
    const result = await service.createdSessionBySessionManager(obj);
    expect(result).toBeFalse();
  });

  it('should delete session after confirmation', async () => {
    const sessionId = '123';
    const deleteResponse = { responseCode: 'OK', message: 'Deleted' };
    utilServiceSpy.alertPopup.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.deleteSession.and.returnValue(Promise.resolve(deleteResponse));

    const result = await service.deleteSession(sessionId);
    expect(utilServiceSpy.alertPopup).toHaveBeenCalled();
    expect(sessionServiceSpy.deleteSession).toHaveBeenCalledWith(sessionId);
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Deleted', 'success');
    expect(result).toEqual(deleteResponse);
  });



  it('should reject if delete session fails', async () => {
    const sessionId = '123';
    const deleteResponse = { responseCode: 'ERROR', message: 'Failed' };
    utilServiceSpy.alertPopup.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.deleteSession.and.returnValue(Promise.resolve(deleteResponse));

    try {
      await service.deleteSession(sessionId);
    } catch (error) {
      expect(error).toEqual(deleteResponse);
    }
  });

  it('should download created sessions list CSV', async () => {
    const obj = { order: 'asc' };
    const mockResponse = { data: 'csv,data' };
    httpServiceSpy.getFile.and.returnValue(Promise.resolve(mockResponse));

    await service.downloadcreatedSessionsBySessionManager(obj);
    expect(httpServiceSpy.getFile).toHaveBeenCalled();
    expect(utilServiceSpy.parseAndDownloadCSV).toHaveBeenCalledWith('csv,data', 'manage_session_list');
  });

  it('should handle download created sessions error', async () => {
    const obj = { order: 'asc' };
    httpServiceSpy.getFile.and.returnValue(Promise.reject('error'));
    // Just verify it doesn't crash
    await service.downloadcreatedSessionsBySessionManager(obj);
    expect(httpServiceSpy.getFile).toHaveBeenCalled();
    expect(utilServiceSpy.parseAndDownloadCSV).not.toHaveBeenCalled();
  });

  it('should download mentee list CSV', async () => {
    const id = '123';
    const mockResponse = { data: 'mentee,csv' };
    httpServiceSpy.getFile.and.returnValue(Promise.resolve(mockResponse));

    await service.downloadMenteeList(id);
    expect(httpServiceSpy.getFile).toHaveBeenCalled(); // verify URL in detail if needed
    expect(utilServiceSpy.parseAndDownloadCSV).toHaveBeenCalledWith('mentee,csv', 'enrolled_mentee_list');
  });

  it('should handle download mentee list error', async () => {
    const id = '123';
    httpServiceSpy.getFile.and.returnValue(Promise.reject('error'));
    await service.downloadMenteeList(id);
    expect(httpServiceSpy.getFile).toHaveBeenCalled();
    expect(utilServiceSpy.parseAndDownloadCSV).not.toHaveBeenCalled();
  });
});
