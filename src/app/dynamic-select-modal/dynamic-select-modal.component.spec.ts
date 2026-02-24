import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { DynamicSelectModalComponent } from './dynamic-select-modal.component';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

describe('DynamicSelectModalComponent', () => {
    let component: DynamicSelectModalComponent;
    let fixture: ComponentFixture<DynamicSelectModalComponent>;
    let modalControllerSpy: jasmine.SpyObj<ModalController>;

    beforeEach(waitForAsync(() => {
        const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

        TestBed.configureTestingModule({
            declarations: [DynamicSelectModalComponent],
            imports: [
                IonicModule.forRoot(),
                TranslateModule.forRoot(),
                FormsModule
            ],
            providers: [
                { provide: ModalController, useValue: modalSpy }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DynamicSelectModalComponent);
        component = fixture.componentInstance;
        modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize filteredItems with items', () => {
            component.items = ['A', 'B'];
            component.ngOnInit();
            expect(component.filteredItems).toEqual(['A', 'B']);
        });
    });

    describe('filterItems', () => {
        beforeEach(() => {
            component.items = ['Apple', 'Banana', 'Cherry'];
            component.filteredItems = [...component.items];
        });

        it('should filter items case-insensitively', () => {
            const event = { target: { value: 'ap' } };
            component.filterItems(event);
            expect(component.filteredItems).toEqual(['Apple']);
        });

        it('should handle empty search term', () => {
            const event = { target: { value: '' } };
            component.filterItems(event);
            expect(component.filteredItems).toEqual(component.items);
        });

        it('should return empty list if no match', () => {
            const event = { target: { value: 'xyz' } };
            component.filterItems(event);
            expect(component.filteredItems).toEqual([]);
        });
    });

    describe('selectItem', () => {
        it('should dismiss modal with selected item', () => {
            component.selectItem('Apple');
            expect(modalControllerSpy.dismiss).toHaveBeenCalledWith('Apple');
        });
    });

    describe('dismiss', () => {
        it('should dismiss modal without data', () => {
            component.dismiss();
            expect(modalControllerSpy.dismiss).toHaveBeenCalled();
        });
    });
});
