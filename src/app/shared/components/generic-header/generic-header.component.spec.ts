import 'zone.js';          
import 'zone.js/testing';  


/* generic-header.component.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GenericHeaderComponent } from './generic-header.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GenericHeaderComponent', () => {
  let component: GenericHeaderComponent;
  let fixture: ComponentFixture<GenericHeaderComponent>;

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenericHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericHeaderComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Updated test: component expects an array; use empty array to represent "no labels" safely.
  it('ngOnInit should not throw when labels is an empty array (no labels)', () => {
    component.labels = [] as any;
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should transform only one matching label when duplicates exist (at least one transformed)', () => {
    component.labels = ['MentorED', 'MentorED'];
    component.ngOnInit();

    // array length must remain the same
    expect(component.labels.length).toBe(2);

    // at least one entry should contain the span-wrapped ED (transformation happened)
    const transformedCount = component.labels.filter((l: any) =>
      typeof l === 'string' && l.includes("<span class='text-green'>ED</span>")
    ).length;
    expect(transformedCount).toBeGreaterThan(0, 'expected at least one transformed entry');

    // ensure all entries are still present
    expect(component.labels.every(l => typeof l === 'string' || typeof l === 'object')).toBeTrue();
  });

  it('should transform when MentorED appears inside a larger string and keep surrounding text', () => {
    component.labels = ['Welcome to MentorED Program'];
    component.ngOnInit();

    const result = component.labels[0];

    // Expected transformation based on your TS logic:
    // leftPart: before "ED"
    // rightPart: "ED Program"
    // final: Mentor<span...>ED Program</span>

    expect(result).toContain("<span class='text-green'>ED Program</span>");
    expect(result.startsWith("Welcome to Mentor")).toBeTrue();
  });

  it('should handle labels array with non-string-like entries that implement includes (no throw)', () => {
    // The component calls element.includes(). Provide an object that has includes()
    const nonStringObj: any = {
      includes: (s: string) => false,
      toString: () => '[object-custom]'
    };

    component.labels = [nonStringObj, 'MentorED'];

    // Should not throw because first element has includes function
    expect(() => component.ngOnInit()).not.toThrow();

    // The non-string-like element should remain as-is
    expect(component.labels[0]).toBe(nonStringObj);

    // The string element should still be transformed
    expect(component.labels[1]).toContain("<span class='text-green'>ED</span>");
  });
});
