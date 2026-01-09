import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LandingPage } from './landing.page';
import { CommonRoutes } from 'src/global.routes';

import { Pipe, PipeTransform, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;
  let mockRouter;
  let mockTranslateService;
  let mockMenuController;

  beforeEach(waitForAsync(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['setDefaultLang', 'get']);
    mockMenuController = jasmine.createSpyObj('MenuController', ['enable']);

    TestBed.configureTestingModule({
      declarations: [LandingPage, MockTranslatePipe],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MenuController, useValue: mockMenuController }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    mockTranslateService.get.and.returnValue(of({})); // Default mock for translation
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(mockMenuController.enable).toHaveBeenCalledWith(false);
  });

  it('ngOnInit should translate text', () => {
    const mockTranslations = { "CREATE_ACCOUNT_TO_CONNECT_SOLVE_&_SHARE": "Translated Text" };
    mockTranslateService.get.and.returnValue(of(mockTranslations));

    fixture.detectChanges(); // triggers ngOnInit

    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.get).toHaveBeenCalledWith(["CREATE_ACCOUNT_TO_CONNECT_SOLVE_&_SHARE"]);
    expect(component.labels[0]).toBe("Translated Text");
  });

  it('onLogin should navigate to login page', () => {
    component.onLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith([`${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`]);
  });

  it('onSignup should navigate to register page', () => {
    component.onSignup();
    expect(mockRouter.navigate).toHaveBeenCalledWith([`${CommonRoutes.AUTH}/${CommonRoutes.REGISTER}`]);
  });
});
