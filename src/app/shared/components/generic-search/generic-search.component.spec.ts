import 'zone.js';          
import 'zone.js/testing';  

/* generic-search.component.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GenericSearchComponent } from './generic-search.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { TranslateModule } from '@ngx-translate/core';

describe('GenericSearchComponent', () => {
  let component: GenericSearchComponent;
  let fixture: ComponentFixture<GenericSearchComponent>;

  beforeEach(waitForAsync(async () => {
    
    await TestBed.configureTestingModule({
       imports: [TranslateModule.forRoot()],
      declarations: [GenericSearchComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericSearchComponent);
    component = fixture.componentInstance;

    // Always ensure the paginator ViewChild is present before change detection
    (component as any).paginator = { pageSize: 10 } as any;

    // sensible default inputs
    component.results = [{ id: 1 }, { id: 2 }];
    component.totalCount = 2;
    component.searchValue = 'abc';

    fixture.detectChanges();
    await fixture.whenStable();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default pageSize and pageSizeOptions from constants', () => {
    expect(component.pageSize).toBe(paginatorConstants.defaultPageSize);
    expect(component.pageSizeOptions).toBe(paginatorConstants.pageSizeOptions);
  });

  it('onPageChange should update page, pageSize and emit onPageChangeEvent payload', async () => {
    spyOn(component.onPageChangeEvent, 'emit');

    // ensure paginator exists and set its pageSize
    (component as any).paginator = (component as any).paginator || { pageSize: 10 };
    (component as any).paginator.pageSize = 25;

    const pageEvent: any = { pageIndex: 2 }; // zero-based -> page = 3

    await component.onPageChange(pageEvent);

    expect(component.page).toBe(3);
    expect(component.pageSize).toBe(25);

    expect(component.onPageChangeEvent.emit).toHaveBeenCalledTimes(1);
    const emitted = (component.onPageChangeEvent.emit as jasmine.Spy).calls.mostRecent().args[0];

    expect(emitted).toEqual({
      page: 3,
      pageSize: 25,
      pageOption: component.pageSizeOptions
    });
  });

  it('eventAction should emit onClickEvent with data and type', async () => {
    spyOn(component.onClickEvent, 'emit');

    const incoming = { data: { id: 55 }, type: 'cardSelect' };

    await component.eventAction(incoming);

    expect(component.onClickEvent.emit).toHaveBeenCalledTimes(1);
    const arg = (component.onClickEvent.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(arg).toEqual({
      data: incoming.data,
      type: incoming.type
    });
  });

  it('onPageChange should use paginator.pageSize even if component.pageSize was different', async () => {
    // Defensive: guarantee paginator is present and set its pageSize
    if (!(component as any).paginator) {
      (component as any).paginator = { pageSize: 50 } as any;
    } else {
      (component as any).paginator.pageSize = 50;
    }

    // set component.pageSize to a different value first
    component.pageSize = 5;

    spyOn(component.onPageChangeEvent, 'emit');

    const pageEvent: any = { pageIndex: 0 }; // first page

    await component.onPageChange(pageEvent);

    expect(component.page).toBe(1);
    expect(component.pageSize).toBe(50);

    const emitted = (component.onPageChangeEvent.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(emitted.pageSize).toBe(50);
  });

  it('eventAction emits correct shape when payloads are different', async () => {
    spyOn(component.onClickEvent, 'emit');

    const incoming = { data: 'abc', type: 'chat' };

    await component.eventAction(incoming);

    expect(component.onClickEvent.emit).toHaveBeenCalledWith({
      data: 'abc',
      type: 'chat'
    });
  });
});
