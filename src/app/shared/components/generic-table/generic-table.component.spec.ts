import 'zone.js';          
import 'zone.js/testing';  

/* generic-table.component.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GenericTableComponent } from './generic-table.component';
import { NO_ERRORS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { TranslateModule } from '@ngx-translate/core';

describe('GenericTableComponent', () => {
  let component: GenericTableComponent;
  let fixture: ComponentFixture<GenericTableComponent>;
  let mockPopover: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(async () => {
    mockPopover = jasmine.createSpyObj('PopoverController', ['dismiss']);

    // Ensure dismiss returns a Promise<boolean> to satisfy typings used in tests
    mockPopover.dismiss.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [GenericTableComponent],
      providers: [
        { provide: PopoverController, useValue: mockPopover }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericTableComponent);
    component = fixture.componentInstance;

    // default inputs
    component.columnData = [
      { name: 'col1', label: 'Column 1' },
      { name: 'col2', label: 'Column 2' }
    ];
    component.tableData = [
      { col1: 'a', col2: 'b' },
      { col1: 'c', col2: 'd' }
    ];
    component.headingText = 'Heading';
    component.totalCount = 2;
    component.noDataMessage = 'No data';
    component.showPaginator = true;
    component.setPaginatorToFirstpage = false;

    // ALWAYS attach a fake paginator so component.ngOnChanges / onPageChange won't throw.
    (component as any).paginator = {
      pageSize: paginatorConstants.defaultPageSize,
      firstPage: jasmine.createSpy('firstPage')
    } as any;

    fixture.detectChanges();
    await fixture.whenStable();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set displayedColumns and dataSource', () => {
    component.ngOnInit();
    expect(component.displayedColumns).toEqual(['col1', 'col2']);
    expect(component.dataSource).toBeTruthy();
    expect(component.dataSource instanceof MatTableDataSource).toBeTrue();
    expect((component.dataSource as MatTableDataSource<any>).data.length).toBe(2);
  });

  it('ngOnChanges should call paginator.firstPage when setPaginatorToFirstpage is true and update dataSource when tableData changes', () => {
    // Ensure paginator stub exists and spy is clean
    (component as any).paginator = (component as any).paginator || { firstPage: jasmine.createSpy('firstPage'), pageSize: paginatorConstants.defaultPageSize };
    ((component as any).paginator.firstPage as jasmine.Spy).calls.reset();

    component.setPaginatorToFirstpage = true;
    const newTableData = [{ col1: 'x', col2: 'y' }];
    const changes: SimpleChanges = {
      setPaginatorToFirstpage: new SimpleChange(false, true, false),
      tableData: new SimpleChange(component.tableData, newTableData, false)
    };

    component.tableData = newTableData;

    component.ngOnChanges(changes);

    // paginator.firstPage should be called
    expect((component as any).paginator.firstPage).toHaveBeenCalled();

    // dataSource should be updated to new tableData
    expect((component.dataSource as MatTableDataSource<any>).data).toEqual(newTableData);
  });

  it('onCellClick should emit onClickEvent with action, columnName and element', () => {
    spyOn(component.onClickEvent, 'emit');

    const action = 'edit';
    const columnName = 'col1';
    const element = { col1: 'val' };

    component.onCellClick(action, columnName, element);

    expect(component.onClickEvent.emit).toHaveBeenCalledTimes(1);
    expect(component.onClickEvent.emit).toHaveBeenCalledWith({
      action: action,
      columnName: columnName,
      element: element
    });
  });

  it('onClickSorting should dismiss popover and emit onSorting with provided data', async () => {
    spyOn(component.onSorting, 'emit');

    const sortData = { direction: 'asc', active: 'col1' };

    mockPopover.dismiss.and.returnValue(Promise.resolve(true));

    await component.onClickSorting(null, sortData);

    expect(mockPopover.dismiss).toHaveBeenCalled();
    expect(component.onSorting.emit).toHaveBeenCalledWith(sortData);
  });

  it('onPageChange should emit paginatorChanged with page and pageSize from paginator', () => {
    spyOn(component.paginatorChanged, 'emit');

    // ensure paginator stub exists and set a pageSize
    (component as any).paginator = (component as any).paginator || { pageSize: 20, firstPage: jasmine.createSpy('firstPage') };
    (component as any).paginator.pageSize = 20;

    const pageEvent = { pageIndex: 1 }; // should become page 2

    component.onPageChange(pageEvent);

    expect(component.paginatorChanged.emit).toHaveBeenCalledTimes(1);
    expect(component.paginatorChanged.emit).toHaveBeenCalledWith({
      page: 2,
      pageSize: 20
    });
  });

  it('should set pageSize and pageSizeOptions from constants', () => {
    expect(component.pageSize).toBe(paginatorConstants.defaultPageSize);
    expect(component.pageSizeOptions).toBe(paginatorConstants.pageSizeOptions);
  });

  // Defensive test: ensure ngOnChanges does not throw when paginator exists and setPaginatorToFirstpage true
  it('ngOnChanges should succeed when paginator exists and setPaginatorToFirstpage is true', () => {
    // Guarantee paginator stub presence
    (component as any).paginator = { firstPage: jasmine.createSpy('firstPage'), pageSize: paginatorConstants.defaultPageSize } as any;
    component.setPaginatorToFirstpage = true;
    const newTableData = [{ col1: 'z', col2: 'y' }];
    const changes: SimpleChanges = {
      setPaginatorToFirstpage: new SimpleChange(false, true, false),
      tableData: new SimpleChange(component.tableData, newTableData, false)
    };

    component.tableData = newTableData;

    expect(() => component.ngOnChanges(changes)).not.toThrow();
    expect((component as any).paginator.firstPage).toHaveBeenCalled();
    expect((component.dataSource as MatTableDataSource<any>).data).toEqual(newTableData);
  });
});
