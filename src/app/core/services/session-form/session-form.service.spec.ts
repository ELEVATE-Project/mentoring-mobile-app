import { TestBed } from '@angular/core/testing';
import { PLATFORMS } from '../../constants/formConstant';
import { FormService } from '../form/form.service';
import { SessionFormService } from './session-form.service';

describe('SessionFormService', () => {
  let service: SessionFormService;
  let formSpy: jasmine.SpyObj<FormService>;

  beforeEach(() => {
    formSpy = jasmine.createSpyObj('FormService', [
      'getForm',
      'formatEntityOptions'
    ]);

    TestBed.configureTestingModule({
      providers: [
        SessionFormService,
        { provide: FormService, useValue: formSpy }
      ]
    });

    service = TestBed.inject(SessionFormService);
  });

  it('getPlatformFormDetails should return the first platform as selected', async () => {
    const forms = [
      { name: 'zoom', hint: 'Zoom hint' },
      { name: 'meet', hint: 'Meet hint' }
    ];
    formSpy.getForm.and.returnValue(Promise.resolve({ data: { fields: { forms } } } as any));

    const result = await service.getPlatformFormDetails();

    expect(formSpy.getForm).toHaveBeenCalledWith(PLATFORMS);
    expect(result).toEqual({
      meetingPlatforms: forms,
      selectedLink: forms[0],
      selectedHint: 'Zoom hint'
    });
  });

  it('preFillData should hydrate controls, meeting info, files, and visibility flags', async () => {
    const meetingPlatforms = [
      {
        name: 'zoom',
        hint: 'Zoom hint',
        form: {
          controls: [
            { name: 'link', value: '' },
            { name: 'meetingId', value: '' },
            { name: 'password', value: '' }
          ]
        }
      }
    ];

    const existingData = {
      meeting_info: {
        platform: 'zoom',
        link: 'https://zoom.us/j/1',
        meta: { meetingId: 'meet-123', password: 'secret' }
      },
      status: { value: 'PUBLISHED' },
      mentees: [{ id: 'mentee-1', value: 'mentee-1', label: 'Mentee 1' }],
      mentor_id: 'mentor-123',
      mentor_name: 'Mentor Name',
      organization: 'Org Name',
      type: { value: 'PUBLIC', label: 'Public' },
      resources: [
        { id: 'res-1', name: 'Guide', type: 'resources', link: 'https://files.test/guide.pdf' }
      ]
    };

    const formData = {
      controls: [
        {
          name: 'mentees',
          type: 'search',
          value: [],
          options: [],
          disabled: false,
          meta: { multiSelect: true, disableIfSelected: false, addPopupType: 'user' },
          validators: {}
        },
        {
          name: 'mentor_id',
          type: 'search',
          value: 'mentor-123',
          options: [],
          disabled: false,
          meta: { multiSelect: false, disableIfSelected: true, addPopupType: 'user' },
          validators: {}
        },
        {
          name: 'resources',
          type: 'search',
          value: [],
          options: [],
          disabled: false,
          meta: { multiSelect: true, disableIfSelected: true, addPopupType: 'file', searchData: [] },
          validators: {}
        },
        {
          name: 'type',
          type: 'select',
          value: null,
          options: [{ value: 'PUBLIC', label: 'Public' }],
          disabled: false,
          meta: {},
          validators: {},
          dependedChild: 'mentees'
        },
        {
          name: 'post',
          type: 'text',
          value: '',
          options: [],
          disabled: false,
          meta: {},
          validators: {}
        }
      ]
    };

    formSpy.formatEntityOptions.and.returnValue(Promise.resolve(existingData as any));

    const result = await service.preFillData(
      existingData,
      formData,
      meetingPlatforms,
      'session-1',
      ['mentor_id', 'mentees'],
      { isCreator: 'true' }
    );

    expect(formSpy.formatEntityOptions).toHaveBeenCalledWith(existingData, ['mentor_id', 'mentees']);
    expect(result.selectedLink).toBe(meetingPlatforms[0]);
    expect(result.selectedHint).toBe('Zoom hint');
    expect(result.isNotCompleted).toBeTrue();
    expect(result.sessionType).toBe('PUBLIC');
    expect(result.mentor_id).toBe('mentor-123');
    expect(result.showForm).toBeTrue();

    expect(meetingPlatforms[0].form.controls[0].value).toBe('https://zoom.us/j/1');
    expect(meetingPlatforms[0].form.controls[1].value).toBe('meet-123');
    expect(meetingPlatforms[0].form.controls[2].value).toBe('secret');

    const menteesControl = result.formData.controls.find((control: any) => control.name === 'mentees');
    const mentorControl = result.formData.controls.find((control: any) => control.name === 'mentor_id');
    const resourcesControl = result.formData.controls.find((control: any) => control.name === 'resources');
    const typeControl = result.formData.controls.find((control: any) => control.name === 'type');

    expect(menteesControl.value).toEqual(['mentee-1']);
    expect(menteesControl.meta.searchData).toEqual(existingData.mentees);
    expect(menteesControl.showField).toBeUndefined();
    expect(mentorControl.disabled).toBeTrue();
    expect(mentorControl.meta.searchData[0].label).toContain('Mentor Name');
    expect(resourcesControl.value).toEqual([
      {
        label: 'Guide',
        id: 'res-1',
        type: 'resources',
        link: 'https://files.test/guide.pdf'
      }
    ]);
    expect(resourcesControl.disabled).toBeTrue();
    expect(typeControl.disabled).toBeTrue();
    expect(menteesControl.validators.required).toBeFalse();
  });

  it('preFillData should disable controls for completed sessions and hide mentees only when applicable', async () => {
    const meetingPlatforms = [
      {
        name: 'meet',
        hint: 'Meet hint',
        form: { controls: [{ name: 'link', value: '' }] }
      }
    ];
    const existingData = {
      meeting_info: { platform: 'meet', link: 'https://meet.google.com/abc' },
      status: { value: 'COMPLETED' },
      type: { value: 'PRIVATE', label: 'Private' },
      resources: []
    };
    const formData = {
      controls: [
        {
          name: 'title',
          type: 'text',
          value: '',
          options: [],
          disabled: false,
          meta: {},
          validators: {}
        },
        {
          name: 'post',
          type: 'text',
          value: '',
          options: [],
          disabled: false,
          meta: {},
          validators: {}
        },
        {
          name: 'mentees',
          type: 'search',
          value: [],
          options: [],
          disabled: false,
          meta: { multiSelect: true, disableIfSelected: false, addPopupType: 'user' },
          validators: {}
        }
      ]
    };

    formSpy.formatEntityOptions.and.returnValue(Promise.resolve(existingData as any));

    const result = await service.preFillData(
      existingData,
      formData,
      meetingPlatforms,
      'session-2',
      [],
      { isCreator: 'false' }
    );

    expect(result.isNotCompleted).toBeFalse();
    expect(result.mentor_id).toBeUndefined();
    expect(result.formData.controls[0].disabled).toBeTrue();
    expect(result.formData.controls[1].disabled).toBeFalse();
    expect(result.formData.controls[2].disabled).toBeTrue();
    expect(result.formData.controls[2].showField).toBeUndefined();
  });
});
