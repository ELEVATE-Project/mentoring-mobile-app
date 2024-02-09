import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JoinDialogBoxComponent } from './join-dialog-box.component';

describe('JoinDialogBoxComponent', () => {
  let component: JoinDialogBoxComponent;
  let fixture: ComponentFixture<JoinDialogBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinDialogBoxComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JoinDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
