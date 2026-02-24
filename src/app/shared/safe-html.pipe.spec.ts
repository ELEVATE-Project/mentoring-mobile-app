import { SafeHtmlPipe } from './safe-html.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('SafeHtmlPipe', () => {
  it('create an instance', () => {
    const sanitizer = TestBed.inject(DomSanitizer);
    const pipe = new SafeHtmlPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});