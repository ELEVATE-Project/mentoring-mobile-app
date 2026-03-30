import { Component, OnInit, ViewChild, inject, signal, ChangeDetectorRef } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';

interface FeedbackItem {
  question_id: number;
  value: string;
  label: string;
}

interface FeedbackPayload {
  feedbacks: FeedbackItem[];
  feedback_as: 'mentor' | 'mentee' | null;
}

@Component({
    selector: 'app-feedback',
    templateUrl: './feedback.page.html',
    styleUrls: ['./feedback.page.scss'],
    standalone: false
})
export class FeedbackPage implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly modalController = inject(ModalController);
  private readonly navParams = inject(NavParams);
  private readonly localStorage = inject(LocalStorageService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('form1') form1: DynamicFormComponent;

  readonly formData = signal<JsonFormData>({
    controls: [],
  });
  readonly feedbackData = signal<FeedbackPayload>({
    feedbacks: [],
    feedback_as: null
  });
  readonly isMentor = signal(false);
  readonly mentorName = signal('');
  readonly sessionTitle = signal('');
  sessionData: { id: string; form: any[] };

  constructor() {
    this.sessionData = this.navParams?.data?.data;
  }

  ngOnInit() {
    this.isMentorChecking();
  }
  async isMentorChecking() {
    const data = await this.sessionService.getSessionDetailsAPI(this.sessionData.id);
    const response = data.result;
    this.mentorName.set(response.mentor_name);
    this.sessionTitle.set(response.title);
    const user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.isMentor.set(user.id === response.mentor_id);

    this.formItems();
    const controls = this.sessionData.form;
    controls.forEach(element => {
      element.name = String(element.id);
    });
    Promise.resolve().then(() => {
      this.formData.set({ controls });
      this.cdr.markForCheck();
    });
    this.feedbackData.update(current => ({
      ...current,
      feedback_as: this.isMentor() ? 'mentor' : 'mentee'
    }));
  }

  formItems(): void {
    for (const formItem of this.sessionData.form) {
      formItem.validators = formItem.rendering_data.validators;
      formItem.class = formItem.rendering_data.class;
    }
  }

  async submit(): Promise<void> {
    this.form1.onSubmit();

    const feedbacks: FeedbackItem[] = [];
    const feedbackKey = Object.keys(this.form1.myForm.value);

    feedbackKey.forEach((key) => {
      if (this.form1.myForm.value[key] !== '') {
        let control: any;
        this.formData().controls.some((element) => {
          if (element.name === key) {
            control = element;
            return element;
          }
          return false;
        });

        if (control) {
          feedbacks.push({
            question_id: control.id,
            value: this.form1.myForm.value[key],
            label: control.label
          });
        }
      }
    });

    this.feedbackData.update(current => ({ ...current, feedbacks }));

    const payload = this.feedbackData();
    const result = payload.feedbacks.length
      ? await this.sessionService.submitFeedback(payload, this.sessionData.id)
      : await this.sessionService.submitFeedback(
          { is_feedback_skipped: true, feedback_as: payload.feedback_as },
          this.sessionData.id
        );

    if (result) {
      this.toast.showToast(result?.message, 'success');
    }

    await this.modalController.dismiss(false);
  }

  async closeModal(): Promise<void> {
    await this.sessionService.submitFeedback(
      { is_feedback_skipped: true, feedback_as: this.feedbackData().feedback_as },
      this.sessionData.id
    );
    await this.modalController.dismiss(false);
  }
}
