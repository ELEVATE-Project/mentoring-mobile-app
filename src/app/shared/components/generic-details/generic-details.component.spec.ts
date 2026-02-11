import 'zone.js';          
import 'zone.js/testing';  

/* generic-details.component.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GenericDetailsComponent } from './generic-details.component';
import { UtilService } from 'src/app/core/services';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';

describe('GenericDetailsComponent', () => {
  let component: GenericDetailsComponent;
  let fixture: ComponentFixture<GenericDetailsComponent>;
  let mockUtil: jasmine.SpyObj<UtilService>;

  beforeEach(waitForAsync(async () => {
    mockUtil = jasmine.createSpyObj('UtilService', ['downloadFile']);

    await TestBed.configureTestingModule({
      declarations: [GenericDetailsComponent],
      providers: [{ provide: UtilService, useValue: mockUtil }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericDetailsComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isArray should return true for arrays and false otherwise', () => {
    expect(component.isArray([])).toBeTrue();
    expect(component.isArray([1, 2, 3])).toBeTrue();
    expect(component.isArray(null)).toBeFalse();
    expect(component.isArray({})).toBeFalse();
  });

  it('ngOnInit should sort controls by sequence and split resources into pre/post', () => {
    component.sessionData = {
      controls: [
        { sequence: 5, name: 'a' },
        { /* no sequence */ name: 'b' },
        { sequence: 2, name: 'c' }
      ],
      data: {
        resources: [
          { type: 'pre', link: 'p1' },
          { type: 'post', link: 'q1' },
          { type: 'pre', link: 'p2' }
        ]
      }
    };

    component.ngOnInit();

    // controls should be sorted ascending: sequence 2, 5, then the item without sequence (Infinity)
    expect(component.sessionData.controls[0].name).toBe('c');
    expect(component.sessionData.controls[1].name).toBe('a');
    expect(component.sessionData.controls[2].name).toBe('b');

    expect(component.preResources.length).toBe(2);
    expect(component.postResources.length).toBe(1);
    expect(component.preResources.map(r => r.link)).toEqual(['p1', 'p2']);
    expect(component.postResources[0].link).toBe('q1');
  });

  it('ngOnInit should handle missing controls and resources gracefully', () => {
    component.sessionData = {}; // no controls or data
    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.preResources).toEqual([]);
    expect(component.postResources).toEqual([]);
  });

  it('ngOnChanges should update preResources and postResources when sessionData changes', () => {
    const newSession = {
      data: {
        resources: [
          { type: 'post', link: 'r1' },
          { type: 'pre', link: 'r2' }
        ]
      }
    };

    // Ensure component has a previous value so ngOnChanges receives a realistic previousValue
    component.sessionData = { data: { resources: [] } };

    // Now set the component property to the new value (mirrors Angular)
    component.sessionData = newSession;

    // Call ngOnChanges with a SimpleChange describing the transition
    component.ngOnChanges({
      sessionData: new SimpleChange(
        { data: [] }, // previousValue
        newSession,   // currentValue
        false         // isFirstChange
      )
    });

    expect(component.preResources.length).toBe(1, 'expected one pre resource');
    expect(component.postResources.length).toBe(1, 'expected one post resource');
    expect(component.preResources[0].link).toBe('r2');
    expect(component.postResources[0].link).toBe('r1');
  });

  it('onClickViewList should emit onViewList', () => {
    spyOn(component.onViewList, 'emit');
    component.onClickViewList();
    expect(component.onViewList.emit).toHaveBeenCalled();
  });

  describe('getFileType', () => {
    it('should return "image" for common image extensions (case-insensitive and with query)', () => {
      expect(component.getFileType({ link: 'http://x/a.jpg' })).toBe('image');
      expect(component.getFileType({ link: 'http://x/a.JPEG' })).toBe('image');
      expect(component.getFileType({ link: 'http://x/a.png?query=1' })).toBe('image');
      expect(component.getFileType({ link: 'http://x/path/to/img.BMP#frag' })).toBe('image');
    });

    it('should return "pdf" for pdf extension', () => {
      expect(component.getFileType({ link: 'http://x/doc.pdf' })).toBe('pdf');
    });

    it('should return "other" for unknown or missing links', () => {
      expect(component.getFileType({ link: 'http://x/file.zip' })).toBe('other');
      expect(component.getFileType(null)).toBe('other');
      expect(component.getFileType({} as any)).toBe('other');
    });
  });

  describe('downloadFile', () => {
    it('should not call utilService.downloadFile when mime_type is "link"', async () => {
      const evt: any = { preventDefault: jasmine.createSpy('preventDefault') };
      const resource = { mime_type: 'link', link: 'http://example', name: 'n' };

      await component.downloadFile(evt as Event, resource);
      // component returns early for mime_type === 'link', so preventDefault should NOT be called
      expect(evt.preventDefault).not.toHaveBeenCalled();
      expect(mockUtil.downloadFile).not.toHaveBeenCalled();
    });

    it('should call utilService.downloadFile when mime_type is not "link"', async () => {
      const evt: any = { preventDefault: jasmine.createSpy('preventDefault') };
      const resource = { mime_type: 'application/pdf', link: 'http://example/file.pdf', name: 'file.pdf' };

      mockUtil.downloadFile.and.returnValue(Promise.resolve());

      await component.downloadFile(evt as Event, resource);
      expect(evt.preventDefault).toHaveBeenCalled();
      expect(mockUtil.downloadFile).toHaveBeenCalledWith(resource.link, resource.name, resource.mime_type);
    });
  });

  describe('image modal', () => {
    it('openImageModal should set selectedImageUrl and isImageModalOpen true', () => {
      component.openImageModal('http://img');
      expect(component.selectedImageUrl).toBe('http://img');
      expect(component.isImageModalOpen).toBeTrue();
    });

    it('closeImageModal should clear selectedImageUrl and set isImageModalOpen false', () => {
      component.selectedImageUrl = 'x';
      component.isImageModalOpen = true;
      component.closeImageModal();
      expect(component.selectedImageUrl).toBeNull();
      expect(component.isImageModalOpen).toBeFalse();
    });
  });
});
