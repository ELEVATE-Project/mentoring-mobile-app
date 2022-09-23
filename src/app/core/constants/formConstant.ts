import { IFORM } from '../interface/form';

export const EDIT_PROFILE_FORM: IFORM = {
  "type": "profile",
  "subType": "createProfile",
  "action": "formFields",
  "ver": "1.0",
  "templateName": "defaultTemplate",
};

export const CREATE_SESSION_FORM: IFORM = {
	"type": "session",
	"subType": "sessionForm",
	"action": "sessionFields",
	"ver": "1.0",
	"templateName": "defaultTemplate"
}

export const TERMS_AND_CONDITIONS_FORM: IFORM = {
	"type": "termsAndConditions",
	"subType": "termsAndConditionsForm",
	"action": "termsAndConditionsFields",
	"ver": "1.0",
	"templateName": "defaultTemplate"
}

export const FAQ: IFORM = {
	"type": "faq",
	"subType": "faqPage",
	"action": "formFields",
	"ver": "1",
	"templateName":"defaultTemplate"
}

export const HELP_VIDEOS: IFORM = {
	"type": "helpVideos",
	"subType": "videos",
	"action": "videoFields",
    "ver": "1",
    "templateName":"defaultTemplate",
}