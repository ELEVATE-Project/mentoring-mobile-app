import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

type TranslationValue = string | Record<string, string>;

function buildTranslationResult(key: string | string[]): TranslationValue {
  if (Array.isArray(key)) {
    return key.reduce<Record<string, string>>((result, entry) => {
      result[entry] = entry;
      return result;
    }, {});
  }

  return key;
}

export function createMockTranslateService(): jasmine.SpyObj<TranslateService> & {
  currentLang: string;
  defaultLang: string;
  onTranslationChange: Observable<unknown>;
  onLangChange: Observable<unknown>;
  onFallbackLangChange: Observable<unknown>;
  onDefaultLangChange: Observable<unknown>;
} {
  const service = jasmine.createSpyObj<TranslateService>('TranslateService', [
    'get',
    'instant',
    'stream',
    'use',
    'setDefaultLang',
    'getCurrentLang',
    'getFallbackLang',
    'getParsedResult'
  ]) as jasmine.SpyObj<TranslateService> & {
    currentLang: string;
    defaultLang: string;
    onTranslationChange: Observable<unknown>;
    onLangChange: Observable<unknown>;
    onFallbackLangChange: Observable<unknown>;
    onDefaultLangChange: Observable<unknown>;
  };

  service.currentLang = 'en';
  service.defaultLang = 'en';
  service.onTranslationChange = of({ lang: 'en', translations: {} });
  service.onLangChange = of({ lang: 'en', translations: {} });
  service.onFallbackLangChange = of({ lang: 'en', translations: {} });
  service.onDefaultLangChange = of({ lang: 'en', translations: {} });

  service.get.and.callFake((key: string | string[]) => of(buildTranslationResult(key)));
  service.instant.and.callFake((key: string | string[]) => buildTranslationResult(key));
  service.stream.and.callFake((key: string | string[]) => of(buildTranslationResult(key)));
  service.use.and.returnValue(of({}));
  service.setDefaultLang.and.stub();
  service.getCurrentLang.and.returnValue('en');
  service.getFallbackLang.and.returnValue('en');
  service.getParsedResult.and.callFake(((key: string | string[]) => of(buildTranslationResult(key))) as any);

  return service;
}
