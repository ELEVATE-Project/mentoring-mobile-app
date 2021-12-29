import { IFORM } from '../interface/form';

export const EDIT_PROFILE_FORM: IFORM = {
  type: 'profile',
  subType: 'createProfile',
  action: 'formFields',
  ver: '1.0',
  templateName: 'defaultTemplate',
};

export const CREATE_SESSION_FORM: IFORM = {
	"type": "session",
	"subType": "sessionForm",
	"action": "sessionFields",
	"ver": "1.0",
	"templateName": "defaultTemplate"
}