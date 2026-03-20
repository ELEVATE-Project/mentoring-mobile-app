import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardPage } from './dashboard.page';

import { HttpService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import moment from 'moment';

// ---------- MOCKS ----------

class MockProfileService {
  isMentor = true;
}

class MockHttpService {
  get = jasmine.createSpy('get').and.returnValue(
    Promise.resolve({
      result: {
        roles: [{ title: 'mentor' }],
        entityTypes: [
          {
            value: 'city',
            label: 'City',
            entities: ['A', 'B']
          }
        ]
      }
    })
  );

  post = jasmine.createSpy('post').and.returnValue(
    Promise.resolve({
      result: {
        data: { total: 10, count: 5 }
      }
    })
  );

  setHeaders = jasmine.createSpy('setHeaders').and.returnValue({
    Authorization: 'Bearer token'
  });
}

class MockFormService {
  getForm = jasmine.createSpy('getForm').and.returnValue(
    Promise.resolve({
      data: {
        fields: {
          mentor: {
            // optional, not really used now
            form: {
              controls: [
                { value: 'city', label: 'City', type: 'text' }
              ]
            },
            ALL: {
              bigNumbers: [
                {
                  Url: 'BN_REPORT',
                  data: [
                    { key: 'total', value: 'dummy' }
                  ]
                }
              ],
              chartConfig: [
                { label: 'DASHBOARD_LABEL', backgroundColor: '#ffffff' }
              ],
              tableUrl: '/table',
              table_report_code: 'TABLE_1',
              chartUrl: '/chart',
              report_code: 'CHART_1'
            }
          },
          // mentee exists because getUserRole puts 'mentee' first
          mentee: {
            ALL: {
              bigNumbers: [],
              chartConfig: [],
              tableUrl: '/table-mentee',
              table_report_code: 'TABLE_MENTEE',
              chartUrl: '/chart-mentee',
              report_code: 'CHART_MENTEE'
            }
          }
        }
      }
    })
  );
}

class MockUtilService {
  downloadFile = jasmine.createSpy('downloadFile').and.returnValue(Promise.resolve());
}

// ---------- TESTS ----------

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let httpService: MockHttpService;
  let formService: MockFormService;
  let utilService: MockUtilService;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardPage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ProfileService, useClass: MockProfileService },
        { provide: HttpService, useClass: MockHttpService },
        { provide: FormService, useClass: MockFormService },
        { provide: UtilService, useClass: MockUtilService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;

    httpService = TestBed.inject(HttpService) as any;
    formService = TestBed.inject(FormService) as any;
    utilService = TestBed.inject(UtilService) as any;
    translate = TestBed.inject(TranslateService);

    // ensure translate.instant returns key for deterministic tests
    spyOn(translate, 'instant').and.callFake((key: string) => key);

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    (httpService.get as any).calls.reset?.();
    (httpService.post as any).calls.reset?.();
    (formService.getForm as any).calls.reset?.();
    (utilService.downloadFile as any).calls.reset?.();
  });

  it('should create the DashboardPage', () => {
    expect(component).toBeTruthy();
  });

  it('should have default header config', () => {
    expect(component.headerConfig).toEqual({
      menu: true,
      label: 'DASHBOARD_PAGE',
      headerColor: 'primary'
    });
  });

  // ---------- ionViewWillEnter ----------

  it('ionViewWillEnter should initialise user, role, cards', fakeAsync(() => {
    const reportFilterSpy = spyOn<any>(component, 'reportFilterListApi').and.returnValue(
      Promise.resolve({
        roles: [{ title: 'mentor' }],
        entityTypes: [
          {
            value: 'city',
            label: 'City',
            entities: ['A', 'B']
          }
        ]
      })
    );

    // do NOT go inside transformData / initialDuration for this test
    const updateFormDataSpy = spyOn<any>(component, 'updateFormData').and.returnValue(
      Promise.resolve()
    );
    const initialDurationSpy = spyOn<any>(component, 'initialDuration').and.returnValue(
      Promise.resolve()
    );

    // override getForm result to have both mentor + mentee keys
    formService.getForm.and.returnValue(
      Promise.resolve({
        data: {
          fields: {
            mentor: {
              form: {
                controls: [
                  { value: 'city', label: 'City', type: 'text' }
                ]
              },
              ALL: {
                bigNumbers: [
                  {
                    Url: 'BN_REPORT',
                    data: [{ key: 'total', value: 'dummy' }]
                  }
                ],
                chartConfig: [
                  { label: 'DASHBOARD_LABEL', backgroundColor: '#ffffff' }
                ],
                tableUrl: '/table',
                table_report_code: 'TABLE_1',
                chartUrl: '/chart',
                report_code: 'CHART_1'
              }
            },
            mentee: {
              ALL: {
                bigNumbers: [],
                chartConfig: [],
                tableUrl: '/table-mentee',
                table_report_code: 'TABLE_MENTEE',
                chartUrl: '/chart-mentee',
                report_code: 'CHART_MENTEE'
              }
            }
          }
        }
      })
    );

    component.ionViewWillEnter();
    tick();

    expect(reportFilterSpy).toHaveBeenCalled();
    expect(formService.getForm).toHaveBeenCalled();
    expect(updateFormDataSpy).toHaveBeenCalledWith(jasmine.any(Object));
    expect(initialDurationSpy).toHaveBeenCalled();

    // getUserRole adds "mentee" first if missing
    expect(component.user()[0]).toBe('mentee');
    expect(component.selectedRole()).toBe('mentee');

    expect(component.isMentor()).toBeTrue();
    expect(component.segment()).toBe('mentor');
    expect(component.filteredCards()).toBeTruthy();
  }));

  // ---------- calculateDuration ----------

  it('calculateDuration should set month range and groupBy', fakeAsync(() => {
    component.selectedDuration.set('month');

    // we don’t want real bigNumberCount / prepareChartUrl (they touch filteredCards etc)
    const bigNumberSpy = spyOn(component, 'bigNumberCount').and.returnValue(
      Promise.resolve()
    );
    const chartSpy = spyOn(component, 'prepareChartUrl').and.returnValue(
      Promise.resolve()
    );

    component.calculateDuration();
    tick(200); // covers the setTimeout(100)

    expect(component.groupBy).toBe('day');
    expect(component.startDate).toBeDefined();
    expect(component.endDate).toBeDefined();
    expect(component.startDateEpoch).toBeGreaterThan(0);
    expect(component.endDateEpoch).toBeGreaterThan(component.startDateEpoch);

    expect(bigNumberSpy).toHaveBeenCalled();
    expect(chartSpy).toHaveBeenCalled();
  }));

  it('calculateDuration should handle week/quarter/year correctly', fakeAsync(() => {
    const bigNumberSpy = spyOn(component, 'bigNumberCount').and.returnValue(Promise.resolve());
    const chartSpy = spyOn(component, 'prepareChartUrl').and.returnValue(Promise.resolve());

    component.selectedDuration.set('week');
    component.calculateDuration();
    tick(200);
    expect(component.groupBy).toBe('day');

    component.selectedDuration.set('quarter');
    component.calculateDuration();
    tick(200);
    expect(component.groupBy).toBe('month');

    component.selectedDuration.set('year');
    component.calculateDuration();
    tick(200);
    expect(component.groupBy).toBe('month');

    expect(bigNumberSpy).toHaveBeenCalled();
    expect(chartSpy).toHaveBeenCalled();
  }));

  // ---------- transformData ----------

  it('transformData should merge entityTypes into form controls', () => {
    const firstObj = {
      form: {
        controls: [
          { value: 'city', label: 'Old City', type: 'text' },
          { value: 'other', label: 'Other', type: 'text' }
        ]
      }
    };

    const secondObj = {
      entityTypes: [
        {
          value: 'city',
          label: 'City Label',
          entities: ['X', 'Y']
        }
      ]
    };

    const result = component.transformData(firstObj, secondObj);
    const cityControl = result.form.controls.find((c: any) => c.value === 'city');

    expect(cityControl).toBeTruthy();
    expect(cityControl.label).toBe('City Label');
    expect(cityControl.entities).toEqual(['X', 'Y']);
    expect(cityControl.type).toBe('select');
  });

  it('transformData should not modify controls when no matching entityType', () => {
    const firstObj = {
      form: {
        controls: [
          { value: 'abc', label: 'ABC', type: 'text' }
        ]
      }
    };
    const secondObj = { entityTypes: [] };

    const result = component.transformData(firstObj, secondObj);
    expect(result.form.controls[0].label).toBe('ABC');
    expect(result.form.controls[0].type).toBe('text');
  });

  // ---------- getTranslatedLabel ----------

  it('getTranslatedLabel should build translatedChartConfig', () => {
    component.session_type.set('ALL');
    component.chartBody.set({
      ALL: {
        chartConfig: [
          { label: 'DASHBOARD_LABEL', backgroundColor: '#fff' }
        ]
      }
    });

    // translate.instant mocked in beforeEach to return key itself
    component.getTranslatedLabel();

    expect(component.translatedChartConfig()).toBeDefined();
    expect(component.translatedChartConfig().length).toBe(1);
    expect(component.translatedChartConfig()[0].label).toBe('DASHBOARD_LABEL');
  });

  // ---------- preparedUrl ----------

  it('preparedUrl should call reportData and return data when value is provided', fakeAsync(() => {
    component.selectedRole.set('mentor');
    component.session_type.set('ALL');
    component.groupBy = 'day';
    component.report_code = 'TEST_REPORT';
    component.startDateEpoch = moment().unix();
    component.endDateEpoch = moment().add(1, 'day').unix();

    const reportDataSpy = spyOn<any>(component, 'reportData').and.returnValue(
      Promise.resolve({
        data: {
          total: 100
        }
      })
    );

    let result: any;
    component.preparedUrl('dummy').then(res => (result = res));
    tick();

    expect(reportDataSpy).toHaveBeenCalled();
    expect(result.total).toBe(100);
  }));

  it('preparedUrl should return undefined if reportData returns no data when no value passed', fakeAsync(() => {
    component.report_code = 'TEST_NO_VAL';
    spyOn<any>(component, 'reportData').and.returnValue(Promise.resolve({}));
    let res: any;
    component.preparedUrl().then(r => (res = r));
    tick();
    expect(res).toBeUndefined();
  }));

  // ---------- bigNumberCount ----------

  it('bigNumberCount should call preparedUrl and set big number values', fakeAsync(() => {
    // set filteredCards with one report that has one bigNumber entry
    component.filteredCards.set({
      ALL: {
        bigNumbers: [
          {
            Url: 'BN_REPORT',
            data: [
              { key: 'total', value: 0 }
            ]
          }
        ]
      }
    });
    component.report_code = 'BN_REPORT';
    // spy preparedUrl to return an object containing the key
    const preparedSpy = spyOn<any>(component, 'preparedUrl').and.returnValue(Promise.resolve({ total: 42 }));
    component.bigNumberCount();
    tick();
    expect(preparedSpy).toHaveBeenCalled();
    expect(component.filteredCards().ALL.bigNumbers[0].data[0].value).toBe(42);
  }));

  // ---------- prepareTableUrl ----------

  it('prepareTableUrl should build tableUrl and headers', fakeAsync(() => {
    (component as any).chartBodyConfig.set({
      tableUrl: '/table',
      table_report_code: 'TABLE_1'
    });

    component.chartBody.set({});
    component.selectedRole.set('mentor');
    component.session_type.set('ALL');
    component.startDateEpoch = 1700000000;
    component.endDateEpoch = 1700003600;

    component.prepareTableUrl();
    tick();

    expect(component.chartBody().tableUrl).toContain('report_code=');
    expect(component.chartBody().headers).toBeDefined();
    expect(httpService.setHeaders).toHaveBeenCalled();
  }));

  // ---------- prepareChartUrl ----------

  it('prepareChartUrl should build chartUrl and headers', fakeAsync(() => {
    (component as any).chartBodyConfig.set({
      chartUrl: '/chart',
      report_code: 'CHART_1'
    });

    component.chartBody.set({});
    component.selectedRole.set('mentor');
    component.session_type.set('ALL');
    component.groupBy = 'day';
    component.startDateEpoch = 1700000000;
    component.endDateEpoch = 1700003600;

    component.prepareChartUrl();
    tick(50); // for internal setTimeout(10)

    expect(component.chartBody().chartUrl).toContain('report_code=');
    expect(component.chartBody().headers).toBeDefined();
    expect(httpService.setHeaders).toHaveBeenCalled();
  }));

  // ---------- downloadCSV ----------

  it('downloadCSV should call utilService.downloadFile', fakeAsync(() => {
    const data = { url: 'http://example.com/file.csv', fileName: 'file.csv' };

    component.downloadCSV(data);
    tick();

    expect(utilService.downloadFile).toHaveBeenCalledWith(data.url, data.fileName);
  }));

  // ---------- handleFormControlChange ----------

  it('handleFormControlChange should update duration and call relevant flows', fakeAsync(() => {
    const bigNumSpy = spyOn(component, 'bigNumberCount').and.returnValue(Promise.resolve());
    const prepChartSpy = spyOn(component, 'prepareChartUrl').and.returnValue(Promise.resolve());

    component.handleFormControlChange('duration', { detail: { value: 'month' } } as any);
    tick(200);

    expect(component.selectedDuration()).toBe('month');
    expect(bigNumSpy).toHaveBeenCalled();
    expect(prepChartSpy).toHaveBeenCalled();
  }));

  it('handleFormControlChange should update session_type when type provided', fakeAsync(() => {
    // Setup filteredCards to prevent bigNumberCount from failing
    component.filteredCards.set({
      SOME: {
        bigNumbers: []
      }
    });
    component.session_type.set('ALL');

    // Spy on bigNumberCount to prevent actual execution
    const bigNumSpy = spyOn(component, 'bigNumberCount').and.returnValue(Promise.resolve());
    const prepChartSpy = spyOn(component, 'prepareChartUrl').and.returnValue(Promise.resolve());

    component.handleFormControlChange('type', { detail: { value: 'SOME' } } as any);
    tick(200);

    expect(component.session_type()).toBe('SOME');
    expect(bigNumSpy).toHaveBeenCalled();
    expect(prepChartSpy).toHaveBeenCalled();
  }));

  it('handleFormControlChange should set entityTypes when selection provided', fakeAsync(() => {
    // Setup filteredCards to prevent bigNumberCount from failing
    component.filteredCards.set({
      ALL: {
        bigNumbers: []
      }
    });
    component.session_type.set('ALL');
    component.entityTypes.set(null);

    // Spy on bigNumberCount to prevent actual execution
    const bigNumSpy = spyOn(component, 'bigNumberCount').and.returnValue(Promise.resolve());
    const prepChartSpy = spyOn(component, 'prepareChartUrl').and.returnValue(Promise.resolve());

    component.handleFormControlChange('city', { detail: { value: ['A'] } } as any);
    tick(200);

    expect(component.entityTypes()?.city).toEqual(['A']);
    expect(bigNumSpy).toHaveBeenCalled();
    expect(prepChartSpy).toHaveBeenCalled();
  }));

  // ---------- handleRoleChange ----------

  it('handleRoleChange should switch role and trigger updates', fakeAsync(() => {
    spyOn(component, 'getTranslatedLabel').and.returnValue(undefined);
    spyOn(component, 'bigNumberCount').and.returnValue(Promise.resolve());
    spyOn(component, 'updateFormData').and.returnValue(Promise.resolve());
    spyOn(component, 'prepareChartUrl').and.returnValue(Promise.resolve());
    spyOn(component, 'prepareTableUrl').and.returnValue(Promise.resolve());
    // simulate form data coming from formService
    component.bigNumberFormData.set({
      mentee: {
        ALL: {
          bigNumbers: [],
          chartConfig: [],
          tableUrl: '/t',
          table_report_code: 'T'
        }
      },
      mentor: {
        ALL: {
          bigNumbers: [],
          chartConfig: [],
          tableUrl: '/t2',
          table_report_code: 'T2'
        }
      }
    });

    component.handleRoleChange({ detail: { value: 'mentor' } } as any);
    tick(200);

    expect(component.selectedRole()).toBe('mentor');
    expect(component.session_type()).toBe('ALL');
  }));

  // ---------- ionViewWillLeave ----------

  it('ionViewWillLeave should close popup if libTableRef has showPopup', () => {
    const closePopupSpy = jasmine.createSpy('closePopup');
    component.libTableRef = {
      showPopup: true,
      closePopup: closePopupSpy
    };

    component.ionViewWillLeave();

    expect(closePopupSpy).toHaveBeenCalled();
  });

  it('ionViewWillLeave should not throw if libTableRef undefined', () => {
    component.libTableRef = undefined;

    expect(() => component.ionViewWillLeave()).not.toThrow();
  });

  // ---------- reportFilterListApi / reportData error handling ----------

  it('reportFilterListApi should handle http errors gracefully', fakeAsync(() => {
    (httpService.get as any).and.returnValue(Promise.reject('error'));
    let res: any;
    component.reportFilterListApi().then(r => (res = r));
    tick();
    expect(res).toBeUndefined();
  }));

  it('reportData should handle http post errors gracefully', fakeAsync(() => {
    (httpService.post as any).and.returnValue(Promise.reject('post error'));
    let res: any;
    component.reportData('/some', {}).then(r => (res = r));
    tick();
    expect(res).toBeUndefined();
  }));

  // ---------- getUserRole ----------

  it('getUserRole should add mentee first if missing', () => {
    const input = { roles: [{ title: 'mentor' }, { title: 'admin' }] };
    const result = component.getUserRole(input as any);
    expect(result[0]).toBe('mentee');
  });

});
