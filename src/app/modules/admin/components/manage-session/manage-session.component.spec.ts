import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ManageSessionComponent } from './manage-session.component';
import { AdminWorkapceService } from 'src/app/core/services/admin-workspace/admin-workapce.service';
import { of } from 'rxjs';
import { CommonRoutes } from 'src/global.routes';
import { MenteeListPopupComponent } from 'src/app/shared/components/mentee-list-popup/mentee-list-popup.component';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ManageSessionComponent', () => {
  let component: ManageSessionComponent;
  let fixture: ComponentFixture<ManageSessionComponent>;
  let mockAdminWorkapceService: any;
  let mockRouter: any;
  let mockModalController: any;

  beforeEach(waitForAsync(() => {
    mockAdminWorkapceService = {
      createdSessionBySessionManager: jasmine.createSpy('createdSessionBySessionManager').and.returnValue(Promise.resolve({
        count: 10,
        data: [{
          id: '1',
          mentor_name: 'Test Mentor',
          mentor_id: 'm1',
          status: { value: 'PUBLISHED', label: 'Upcoming' },
          start_date: 1672531200, // Some timestamp
          end_date: 1672534800,
          duration_in_minutes: 60,
          type: { label: 'Public' }
        }]
      })),
      deleteSession: jasmine.createSpy('deleteSession').and.returnValue(Promise.resolve({ responseCode: 'OK' })),
      downloadcreatedSessionsBySessionManager: jasmine.createSpy('downloadcreatedSessionsBySessionManager')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockModalController = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: null }))
      }))
    };

    TestBed.configureTestingModule({
      declarations: [ManageSessionComponent],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        { provide: AdminWorkapceService, useValue: mockAdminWorkapceService },
        { provide: Router, useValue: mockRouter },
        { provide: ModalController, useValue: mockModalController }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch session list on init', () => {
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalled();
  });

  it('should navigate to mentor details on mentor_name action', () => {
    const data = {
      action: 'mentor_name',
      element: { mentor_id: '123' }
    };
    component.onCLickEvent(data);
    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, '123']);
  });

  it('should open mentee list popup on mentee_count action', async () => {
    const data = {
      action: 'mentee_count',
      element: { id: 'session1' }
    };
    await component.onCLickEvent(data);
    expect(mockModalController.create).toHaveBeenCalledWith({
      component: MenteeListPopupComponent,
      cssClass: 'large-width-popover-config',
      componentProps: { id: 'session1' }
    });
  });

  it('should delete session and refresh list', async () => {
    const data = {
      action: 'DELETE',
      element: { id: 'session1' }
    };
    await component.onCLickEvent(data);
    expect(mockAdminWorkapceService.deleteSession).toHaveBeenCalledWith('session1');
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalledTimes(2); // Init + Refresh
  });

  it('should navigate to edit session', () => {
    const data = {
      action: 'EDIT',
      element: { id: 'session1', status: 'Upcoming' }
    };
    component.onCLickEvent(data);
    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CREATE_SESSION], { queryParams: { id: 'session1' } });
  });

  it('should update pagination and refresh list', () => {
    const pageData = { page: 2, pageSize: 10 };
    component.onPaginatorChange(pageData);
    expect(component.page).toBe(2);
    expect(component.limit).toBe(10);
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalled();
  });

  it('should update sorting and refresh list', () => {
    const sortData = { sort_by: 'title', order: 'asc' };
    component.onSorting(sortData);
    expect(component.sortingData).toEqual(sortData);
    expect(component.page).toBe(1);
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalled();
  });

  it('should search and refresh list', () => {
    const event = { searchText: 'test' };
    component.searchResults(event);
    expect(component.searchText).toBe('test');
    expect(component.page).toBe(1);
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalled();
  });

  it('should open filter modal and apply filters', async () => {
    const filterData = {
      data: {
        selectedFilters: { status: [{ value: 'PUBLISHED' }] }
      }
    };

    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: filterData }));
    mockModalController.create.and.returnValue(Promise.resolve(modalSpy));

    await component.onClickFilter();
    expect(mockModalController.create).toHaveBeenCalled();

    // Wait for promise resolution
    await fixture.whenStable();

    expect(component.filteredDatas['status']).toBe('PUBLISHED');
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalled();
  });

  it('should download sessions', () => {
    component.onClickDownload();
    expect(mockAdminWorkapceService.downloadcreatedSessionsBySessionManager).toHaveBeenCalled();
  });

  it('should navigate to create session', () => {
    component.createSession();
    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CREATE_SESSION], { queryParams: { source: 'manage' } });
  });

  it('should change segment', () => {
    const event = { target: { value: 'new-segment' } };
    component.segmentChanged(event as any);
    expect(component.segmentType()).toBe('new-segment');
  });

  it('should clear search and refresh', () => {
    component.onClearSearch('');
    expect(component.searchText).toBe('');
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalled();
  });

  it('should refresh list on search', () => {
    component.onSearch();
    expect(component.page).toBe(1);
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalled();
  });

  it('should refresh list on ionViewWillEnter', () => {
    component.ionViewWillEnter();
    expect(mockAdminWorkapceService.createdSessionBySessionManager).toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    mockAdminWorkapceService.deleteSession.and.returnValue(Promise.reject('error'));
    const data = {
      action: 'DELETE',
      element: { id: 'session1' }
    };
    await component.onCLickEvent(data);
    expect(mockAdminWorkapceService.deleteSession).toHaveBeenCalledWith('session1');
  });

  it('should handle mentee modal dismiss', async () => {
    const data = {
      action: 'mentee_count',
      element: { id: 'session1' }
    };
    await component.onCLickEvent(data);
    expect(mockModalController.create).toHaveBeenCalled();
  });
  it('should navigate to session details default action', () => {
    const data = {
      action: 'UNKNOWN_ACTION',
      element: { id: 'session1' }
    };
    component.onCLickEvent(data);
    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.SESSIONS_DETAILS, 'session1']);
  });

  it('should navigate to edit session with type segment if status is Live', () => {
    const data = {
      action: 'EDIT',
      element: { id: 'session1', status: 'Live' }
    };
    component.onCLickEvent(data);
    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CREATE_SESSION], { queryParams: { id: 'session1', type: 'segment' } });
  });

  it('should handle fetchSessionList with LIVE status', async () => {
    const currentTimeIndex = Math.floor(Date.now() / 1000);
    mockAdminWorkapceService.createdSessionBySessionManager.and.returnValue(Promise.resolve({
      count: 1,
      data: [{
        id: '2',
        status: { value: 'LIVE', label: 'Live' },
        start_date: currentTimeIndex - 1000,
        end_date: currentTimeIndex + 3600,
        type: { label: 'Public' },
        duration_in_minutes: 60
      }]
    }));
    await component.fetchSessionList();
    expect(component.tableData()[0].action).toEqual(component.actionButtons['LIVE']);
  });

  it('should handle fetchSessionList with UPCOMING status', async () => {
    const currentTimeIndex = Math.floor(Date.now() / 1000);
    mockAdminWorkapceService.createdSessionBySessionManager.and.returnValue(Promise.resolve({
      count: 1,
      data: [{
        id: '4',
        status: { value: 'PUBLISHED', label: 'Upcoming' },
        start_date: currentTimeIndex + 1000,
        end_date: currentTimeIndex + 4600,
        type: { label: 'Public' },
        duration_in_minutes: 60
      }]
    }));
    await component.fetchSessionList();
    expect(component.tableData()[0].action).toEqual(component.actionButtons['UPCOMING']);
  });

  it('should handle fetchSessionList with COMPLETED status', async () => {
    const currentTimeIndex = Math.floor(Date.now() / 1000);
    mockAdminWorkapceService.createdSessionBySessionManager.and.returnValue(Promise.resolve({
      count: 1,
      data: [{
        id: '3',
        status: { value: 'COMPLETED', label: 'Completed' },
        start_date: currentTimeIndex - 40000,
        end_date: currentTimeIndex - 3600,
        type: { label: 'Private' },
        duration_in_minutes: 60
      }]
    }));
    await component.fetchSessionList();
    expect(component.tableData()[0].action).toEqual(component.actionButtons['COMPLETED']);
  });

  it('should handle fetchSessionList with empty data', async () => {
    mockAdminWorkapceService.createdSessionBySessionManager.and.returnValue(Promise.resolve({
      count: 0,
      data: []
    }));
    await component.fetchSessionList();
    expect(component.tableData()).toEqual([]);
    expect(component.noDataMessage()).toBe('SEARCH_RESULT_NOT_FOUND');
  });

  it('should handle filter modal dismissal with role closed', async () => {
    const validFilterData = [{
      title: 'Status',
      name: 'status',
      options: [],
      type: 'checkbox'
    }];
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { role: 'closed', data: validFilterData } }));
    mockModalController.create.and.returnValue(Promise.resolve(modalSpy));

    await component.onClickFilter();

    expect(component.filterData).toEqual(validFilterData);
  });
});
