import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { UserListModalComponent } from './user-list-modal.component';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('UserListModalComponent', () => {
  let component: UserListModalComponent;
  let fixture: ComponentFixture<UserListModalComponent>;
  let mockModalController: any;

  beforeEach(waitForAsync(() => {
    mockModalController = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [UserListModalComponent, MockTranslatePipe],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: mockModalController }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closeModal should dismiss the modal', () => {
    component.closeModal();
    expect(mockModalController.dismiss).toHaveBeenCalled();
  });
});
