import { TestBed } from '@angular/core/testing';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
    let service: NetworkService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(NetworkService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check network status changes', async () => {
        const mockStatus = { connected: true, connectionType: 'wifi' } as any;
        const addListenerSpy = jasmine.createSpy('addListener').and.callFake((eventName, callback) => {
            callback(mockStatus);
            return Promise.resolve({ remove: () => { } });
        });

        // Mock the network property on the service instance
        service.network = {
            addListener: addListenerSpy,
            getStatus: jasmine.createSpy('getStatus')
        } as any;

        spyOn(service, 'getCurrentStatus'); // Spy on internal call if needed, or let it run. 
        // If we let it run, we must mock getStatus too. I'll mock getStatus.

        // Resetting getCurrentStatus spy if I want to test netWorkCheck without caring about getCurrentStatus implementation
        // But better to spy on service.getCurrentStatus to isolate netWorkCheck logic vs getCurrentStatus logic.
        // Yes, spyOn(service, 'getCurrentStatus') is good.

        service.netWorkCheck();

        expect(addListenerSpy).toHaveBeenCalled();
        expect(service.isNetworkAvailable).toBe(true);
    });

    it('should get current status', async () => {
        const mockStatus = { connected: true, connectionType: 'wifi' } as any;
        const getStatusSpy = jasmine.createSpy('getStatus').and.returnValue(Promise.resolve(mockStatus));

        service.network = {
            addListener: jasmine.createSpy('addListener'),
            getStatus: getStatusSpy
        } as any;

        await service.getCurrentStatus();
        expect(getStatusSpy).toHaveBeenCalled();
        expect(service.isNetworkAvailable).toBe(true);
    });
});
