import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './localstorage.service';
import { Storage } from '@ionic/storage';

describe('LocalStorageService', () => {
    let service: LocalStorageService;
    let storageSpy: any;

    beforeEach(async () => {
        storageSpy = jasmine.createSpyObj('Storage', ['create', 'set', 'get', 'clear', 'remove']);
        storageSpy.create.and.returnValue(Promise.resolve(storageSpy));
        storageSpy.set.and.returnValue(Promise.resolve());
        storageSpy.get.and.returnValue(Promise.resolve('testData'));
        storageSpy.clear.and.returnValue(Promise.resolve());
        storageSpy.remove.and.returnValue(Promise.resolve());

        await TestBed.configureTestingModule({
            providers: [
                LocalStorageService,
                { provide: Storage, useValue: storageSpy }
            ]
        }).compileComponents();

        service = TestBed.inject(LocalStorageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set local data', async () => {
        await service.setLocalData('key', 'value');
        expect(storageSpy.set).toHaveBeenCalledWith('key', 'value');
    });

    it('should get local data', async () => {
        const data = await service.getLocalData('key');
        expect(storageSpy.get).toHaveBeenCalledWith('key');
        expect(data).toBe('testData');
    });

    it('should get null if no data', async () => {
        storageSpy.get.and.returnValue(Promise.resolve(null));
        const data = await service.getLocalData('key');
        expect(data).toBeNull();
    });

    it('should delete all data', async () => {
        await service.deleteAll();
        expect(storageSpy.clear).toHaveBeenCalled();
    });

    it('should delete specific data', async () => {
        await service.delete('key');
        expect(storageSpy.remove).toHaveBeenCalledWith('key');
    });

    it('should handle getLocalData error', async () => {
        storageSpy.get.and.returnValue(Promise.reject('error'));
        try {
            await service.getLocalData('key');
        } catch (error) {
            expect(error).toBe('error');
        }
    });

    it('should handle deleteAll error', async () => {
        storageSpy.clear.and.returnValue(Promise.reject('error'));
        try {
            await service.deleteAll();
        } catch (error) {
            expect(storageSpy.clear).toHaveBeenCalled();
        }
    });
});
