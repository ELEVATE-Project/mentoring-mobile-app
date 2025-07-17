import { IFORM } from '../interface/form';

export const EDIT_PROFILE_FORM: IFORM = {
	"type": "editProfile",
	"sub_type": "editProfileForm"
};

export const CREATE_SESSION_FORM: IFORM = {
	"type": "session",
	"sub_type": "sessionForm",
}

export const TERMS_AND_CONDITIONS_FORM: IFORM = {
	"type": "termsAndConditions",
	"sub_type": "termsAndConditionsForm",
}

export const FAQ: IFORM = {
	"type": "faq",
	"sub_type": "faqPage",
}

export const HELP_VIDEOS: IFORM = {
	"type": "helpVideos",
	"sub_type": "videos",
}

export const PLATFORMS: IFORM = {
	"type": "platformApp",
	"sub_type": "platformAppForm",
}

export const HELP: IFORM = {
	"type": "helpApp",
	"sub_type": "helpAppForm",
}

export const MENTOR_QUESTIONNAIRE: IFORM = {
	"type": "mentorQuestionnaire",
	"sub_type": "mentorQuestionnaireForm",
}

export const SAMPLE_CSV_DOWNLOAD_URL = {
	"type": "sampleCsvDownload",
	"sub_type": "sampleCsvDownload"
}

export const MANAGERS_CREATE_SESSION_FORM: IFORM = {
	"type": "managersSession",
	"sub_type": "managersSessionForm",
}

export const BIG_NUMBER_DASHBOARD_FORM: IFORM = {
	"type": "bignumberDashboard",
	"sub_type": "bignumberDashboardForm"
}
export const DASHBOARD: IFORM = {
	"type": "dashboard",
	"sub_type": "dashboardForm",
}
export const FILTER_ROLES = {
	"title": "Roles",
	"name": "roles",
	"options": [
		{
			"label": "Mentor",
			"value": "mentor"
		},
		{
			"label": "Mentee",
			"value": "Mentee"
		}
	],
	"type": "checkbox"
}

export const DASHBOARD_TABLE_META_KEYS ={
	"reportDateError":"END_DATE_LESS_THAN_STARTDATE",
	  "reportTableNoSessions" : "NO_SESSIONS_FOUND_TIME_PERIOD",
	  "submit":"SUBMIT",
	  "endDate":"END_DATE",
	  "startDate":"START_DATE",
	  "selectDateRange":"SELECT_DATE_RANGE",
	  "selectDate":"SELECT_DATE",
	  "noData":"NO_SESSIONS_FOUND",
	  "clearFilters":"CLEAR_FILTERS",
	  "downloadTable":"DOWNLOAD_TABLE",
	  "search":"SEARCH",
	  "select":"SELECT",
	  "invalidSearch":"INVALID_SEARCH",
	  "chooseADate":"CHOOSE_A_DATE",
	  "noSessions":"NO_SESSIONS",
	  "noDataFound":"NO_SESSIONS_FOUND",
	"cancel":"CANCEL"}

export const REQUEST_SESSION_FORM: IFORM = {
	"type": "requestSession",
	"sub_type": "requestSessionForm",
}

export const CHAT_LIB_META_KEYS = {
	"cantSendMsg": "CANT_SEND_MESSAGE",
	"cantSendMsgToMentor": "CANT_SEND_MESSAGE_TO_MENTOR",
}