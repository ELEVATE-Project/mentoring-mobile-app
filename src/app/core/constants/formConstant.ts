import { IFORM } from '../interface/form';

export const EDIT_PROFILE_FORM: IFORM = {
	"type": "profile",
	"subType": "profileForm",
	"action": "profileFields",
	"templateName": "defaultTemplate",
};

export const CREATE_SESSION_FORM: IFORM = {
	"type": "session",
	"subType": "sessionForm",
	"action": "sessionFields",
	"templateName": "defaultTemplate"
}

export const TERMS_AND_CONDITIONS_FORM: IFORM = {
	"type": "termsAndConditions",
	"sub_type": "termsAndConditionsForm",
}

export const FAQ: IFORM = {
	"type": "faq",
	"subType": "faqPage",
	"action": "formFields",
	"templateName":"defaultTemplate"
}

export const HELP_VIDEOS: IFORM = {
	"type": "helpVideos",
	"subType": "videos",
	"action": "videoFields",
    "templateName":"defaultTemplate",
}

export const PLATFORMS: IFORM = {
	"type": "platformApp",
	"subType": "platformAppForm",
	"action": "platformAppFields",
	"templateName": "defaultTemplate"	
}

export const HELP: IFORM = {
	"type": "helpApp",
	"subType": "helpAppForm",
	"action": "helpAppFields",
	"templateName":"defaultTemplate"
}